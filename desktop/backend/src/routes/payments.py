"""
Payment Integration Routes - Instituto Buriti
Integração com APIs de pagamento (PagSeguro, Stripe, etc.)
"""

from flask import Blueprint, request, jsonify, current_app
from werkzeug.exceptions import BadRequest
import hashlib
import hmac
import json
import uuid
from datetime import datetime, timedelta
import requests
from ..models.user import User
from ..models.payment import Payment, Subscription, Transaction
from ..database import db

payments_bp = Blueprint('payments', __name__)

# Configurações de pagamento (em produção, usar variáveis de ambiente)
PAGSEGURO_CONFIG = {
    'email': 'contato@institutoburiti.com.br',
    'token': 'sandbox_token_here',
    'sandbox': True,
    'webhook_token': 'webhook_secret_token'
}

STRIPE_CONFIG = {
    'public_key': 'pk_test_stripe_key_here',
    'secret_key': 'sk_test_stripe_key_here',
    'webhook_secret': 'whsec_stripe_webhook_secret'
}

@payments_bp.route('/create-payment-intent', methods=['POST'])
def create_payment_intent():
    """Criar intenção de pagamento"""
    try:
        data = request.get_json()
        
        # Validar dados obrigatórios
        required_fields = ['amount', 'currency', 'payment_method', 'customer_data']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Campo obrigatório: {field}'}), 400
        
        # Gerar ID único para a transação
        transaction_id = str(uuid.uuid4())
        
        # Criar registro de transação
        transaction = Transaction(
            id=transaction_id,
            user_id=data.get('user_id'),
            amount=data['amount'],
            currency=data['currency'],
            payment_method=data['payment_method'],
            status='pending',
            gateway='pagseguro' if data['payment_method'] in ['credit_card', 'pix', 'boleto'] else 'stripe',
            customer_data=json.dumps(data['customer_data']),
            product_data=json.dumps(data.get('product_data', {})),
            created_at=datetime.utcnow()
        )
        
        db.session.add(transaction)
        db.session.commit()
        
        # Processar baseado no método de pagamento
        if data['payment_method'] == 'credit_card':
            result = process_credit_card_payment(transaction, data)
        elif data['payment_method'] == 'pix':
            result = process_pix_payment(transaction, data)
        elif data['payment_method'] == 'boleto':
            result = process_boleto_payment(transaction, data)
        else:
            return jsonify({'error': 'Método de pagamento não suportado'}), 400
        
        return jsonify(result), 200
        
    except Exception as e:
        current_app.logger.error(f'Erro ao criar pagamento: {str(e)}')
        return jsonify({'error': 'Erro interno do servidor'}), 500

def process_credit_card_payment(transaction, data):
    """Processar pagamento com cartão de crédito"""
    try:
        # Simular integração com PagSeguro/Stripe
        card_data = data.get('card_data', {})
        
        # Validar dados do cartão
        if not validate_card_data(card_data):
            transaction.status = 'failed'
            transaction.failure_reason = 'Dados do cartão inválidos'
            db.session.commit()
            return {
                'success': False,
                'error': 'Dados do cartão inválidos',
                'transaction_id': transaction.id
            }
        
        # Simular processamento (em produção, chamar API real)
        payment_result = simulate_card_payment(transaction, card_data)
        
        # Atualizar transação
        transaction.status = payment_result['status']
        transaction.gateway_transaction_id = payment_result.get('gateway_id')
        transaction.gateway_response = json.dumps(payment_result)
        
        if payment_result['status'] == 'failed':
            transaction.failure_reason = payment_result.get('error', 'Falha no processamento')
        
        db.session.commit()
        
        # Se aprovado, criar/atualizar assinatura
        if payment_result['status'] == 'approved':
            handle_successful_payment(transaction, data)
        
        return {
            'success': payment_result['status'] == 'approved',
            'transaction_id': transaction.id,
            'status': payment_result['status'],
            'gateway_id': payment_result.get('gateway_id'),
            'message': payment_result.get('message', 'Pagamento processado')
        }
        
    except Exception as e:
        current_app.logger.error(f'Erro no pagamento com cartão: {str(e)}')
        transaction.status = 'failed'
        transaction.failure_reason = 'Erro interno'
        db.session.commit()
        return {
            'success': False,
            'error': 'Erro no processamento do pagamento',
            'transaction_id': transaction.id
        }

def process_pix_payment(transaction, data):
    """Processar pagamento via PIX"""
    try:
        # Gerar código PIX
        pix_code = generate_pix_code(transaction)
        
        # Atualizar transação com dados do PIX
        transaction.status = 'pending'
        transaction.pix_code = pix_code
        transaction.expires_at = datetime.utcnow() + timedelta(minutes=30)
        db.session.commit()
        
        return {
            'success': True,
            'transaction_id': transaction.id,
            'status': 'pending',
            'pix_code': pix_code,
            'qr_code': generate_pix_qr_code(pix_code),
            'expires_at': transaction.expires_at.isoformat(),
            'message': 'PIX gerado com sucesso. Pagamento expira em 30 minutos.'
        }
        
    except Exception as e:
        current_app.logger.error(f'Erro no pagamento PIX: {str(e)}')
        transaction.status = 'failed'
        transaction.failure_reason = 'Erro na geração do PIX'
        db.session.commit()
        return {
            'success': False,
            'error': 'Erro na geração do PIX',
            'transaction_id': transaction.id
        }

def process_boleto_payment(transaction, data):
    """Processar pagamento via boleto"""
    try:
        # Gerar boleto
        boleto_data = generate_boleto(transaction, data)
        
        # Atualizar transação
        transaction.status = 'pending'
        transaction.boleto_url = boleto_data['url']
        transaction.boleto_barcode = boleto_data['barcode']
        transaction.expires_at = datetime.utcnow() + timedelta(days=3)
        db.session.commit()
        
        return {
            'success': True,
            'transaction_id': transaction.id,
            'status': 'pending',
            'boleto_url': boleto_data['url'],
            'boleto_barcode': boleto_data['barcode'],
            'expires_at': transaction.expires_at.isoformat(),
            'message': 'Boleto gerado com sucesso. Vencimento em 3 dias.'
        }
        
    except Exception as e:
        current_app.logger.error(f'Erro no pagamento boleto: {str(e)}')
        transaction.status = 'failed'
        transaction.failure_reason = 'Erro na geração do boleto'
        db.session.commit()
        return {
            'success': False,
            'error': 'Erro na geração do boleto',
            'transaction_id': transaction.id
        }

@payments_bp.route('/webhook/pagseguro', methods=['POST'])
def pagseguro_webhook():
    """Webhook do PagSeguro para notificações de pagamento"""
    try:
        # Verificar autenticidade do webhook
        if not verify_pagseguro_webhook(request):
            return jsonify({'error': 'Webhook não autorizado'}), 401
        
        # Processar notificação
        notification_data = request.get_json() or {}
        notification_code = notification_data.get('notificationCode')
        
        if notification_code:
            # Consultar status da transação no PagSeguro
            transaction_status = query_pagseguro_transaction(notification_code)
            
            # Atualizar transação local
            update_transaction_status(transaction_status)
        
        return jsonify({'status': 'ok'}), 200
        
    except Exception as e:
        current_app.logger.error(f'Erro no webhook PagSeguro: {str(e)}')
        return jsonify({'error': 'Erro interno'}), 500

@payments_bp.route('/webhook/stripe', methods=['POST'])
def stripe_webhook():
    """Webhook do Stripe para notificações de pagamento"""
    try:
        payload = request.get_data()
        sig_header = request.headers.get('Stripe-Signature')
        
        # Verificar assinatura do webhook
        if not verify_stripe_webhook(payload, sig_header):
            return jsonify({'error': 'Webhook não autorizado'}), 401
        
        # Processar evento
        event = json.loads(payload)
        handle_stripe_event(event)
        
        return jsonify({'status': 'ok'}), 200
        
    except Exception as e:
        current_app.logger.error(f'Erro no webhook Stripe: {str(e)}')
        return jsonify({'error': 'Erro interno'}), 500

@payments_bp.route('/transaction/<transaction_id>/status', methods=['GET'])
def get_transaction_status(transaction_id):
    """Consultar status de uma transação"""
    try:
        transaction = Transaction.query.filter_by(id=transaction_id).first()
        
        if not transaction:
            return jsonify({'error': 'Transação não encontrada'}), 404
        
        return jsonify({
            'transaction_id': transaction.id,
            'status': transaction.status,
            'amount': float(transaction.amount),
            'currency': transaction.currency,
            'payment_method': transaction.payment_method,
            'created_at': transaction.created_at.isoformat(),
            'updated_at': transaction.updated_at.isoformat() if transaction.updated_at else None,
            'gateway_id': transaction.gateway_transaction_id,
            'failure_reason': transaction.failure_reason,
            'pix_code': transaction.pix_code,
            'boleto_url': transaction.boleto_url,
            'expires_at': transaction.expires_at.isoformat() if transaction.expires_at else None
        }), 200
        
    except Exception as e:
        current_app.logger.error(f'Erro ao consultar transação: {str(e)}')
        return jsonify({'error': 'Erro interno do servidor'}), 500

@payments_bp.route('/subscription/create', methods=['POST'])
def create_subscription():
    """Criar nova assinatura"""
    try:
        data = request.get_json()
        
        # Validar dados
        required_fields = ['user_id', 'plan_type', 'payment_method']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Campo obrigatório: {field}'}), 400
        
        # Verificar se usuário existe
        user = User.query.get(data['user_id'])
        if not user:
            return jsonify({'error': 'Usuário não encontrado'}), 404
        
        # Verificar se já tem assinatura ativa
        existing_subscription = Subscription.query.filter_by(
            user_id=data['user_id'],
            status='active'
        ).first()
        
        if existing_subscription:
            return jsonify({'error': 'Usuário já possui assinatura ativa'}), 400
        
        # Criar assinatura
        subscription = Subscription(
            user_id=data['user_id'],
            plan_type=data['plan_type'],
            status='pending',
            payment_method=data['payment_method'],
            created_at=datetime.utcnow()
        )
        
        # Definir valores baseado no plano
        plan_prices = {
            'basic': 29.90,
            'premium': 59.90,
            'annual': 499.90
        }
        
        subscription.amount = plan_prices.get(data['plan_type'], 59.90)
        
        # Definir próxima cobrança
        if data['plan_type'] == 'annual':
            subscription.next_billing = datetime.utcnow() + timedelta(days=365)
        else:
            subscription.next_billing = datetime.utcnow() + timedelta(days=30)
        
        db.session.add(subscription)
        db.session.commit()
        
        return jsonify({
            'subscription_id': subscription.id,
            'status': subscription.status,
            'plan_type': subscription.plan_type,
            'amount': float(subscription.amount),
            'next_billing': subscription.next_billing.isoformat()
        }), 201
        
    except Exception as e:
        current_app.logger.error(f'Erro ao criar assinatura: {str(e)}')
        return jsonify({'error': 'Erro interno do servidor'}), 500

@payments_bp.route('/subscription/<int:subscription_id>/cancel', methods=['POST'])
def cancel_subscription(subscription_id):
    """Cancelar assinatura"""
    try:
        subscription = Subscription.query.get(subscription_id)
        
        if not subscription:
            return jsonify({'error': 'Assinatura não encontrada'}), 404
        
        if subscription.status == 'cancelled':
            return jsonify({'error': 'Assinatura já está cancelada'}), 400
        
        # Cancelar assinatura
        subscription.status = 'cancelled'
        subscription.cancelled_at = datetime.utcnow()
        subscription.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'subscription_id': subscription.id,
            'status': subscription.status,
            'cancelled_at': subscription.cancelled_at.isoformat(),
            'message': 'Assinatura cancelada com sucesso'
        }), 200
        
    except Exception as e:
        current_app.logger.error(f'Erro ao cancelar assinatura: {str(e)}')
        return jsonify({'error': 'Erro interno do servidor'}), 500

@payments_bp.route('/coupons/validate', methods=['POST'])
def validate_coupon():
    """Validar cupom de desconto"""
    try:
        data = request.get_json()
        coupon_code = data.get('code', '').upper()
        
        # Cupons simulados (em produção, usar banco de dados)
        coupons = {
            'BURITI10': {'type': 'percentage', 'value': 10, 'min_amount': 0},
            'BEMVINDO': {'type': 'percentage', 'value': 20, 'min_amount': 50},
            'NATAL2025': {'type': 'fixed', 'value': 50, 'min_amount': 100}
        }
        
        if coupon_code not in coupons:
            return jsonify({
                'valid': False,
                'error': 'Cupom não encontrado ou inválido'
            }), 400
        
        coupon = coupons[coupon_code]
        amount = data.get('amount', 0)
        
        if amount < coupon['min_amount']:
            return jsonify({
                'valid': False,
                'error': f'Valor mínimo para este cupom: R$ {coupon["min_amount"]:.2f}'
            }), 400
        
        # Calcular desconto
        if coupon['type'] == 'percentage':
            discount = amount * (coupon['value'] / 100)
        else:
            discount = coupon['value']
        
        # Garantir que desconto não seja maior que o valor
        discount = min(discount, amount)
        
        return jsonify({
            'valid': True,
            'code': coupon_code,
            'type': coupon['type'],
            'value': coupon['value'],
            'discount': discount,
            'final_amount': amount - discount
        }), 200
        
    except Exception as e:
        current_app.logger.error(f'Erro ao validar cupom: {str(e)}')
        return jsonify({'error': 'Erro interno do servidor'}), 500

# Funções auxiliares

def validate_card_data(card_data):
    """Validar dados do cartão de crédito"""
    required_fields = ['number', 'expiry_month', 'expiry_year', 'cvv', 'holder_name']
    
    for field in required_fields:
        if field not in card_data or not card_data[field]:
            return False
    
    # Validar número do cartão (algoritmo de Luhn)
    card_number = card_data['number'].replace(' ', '').replace('-', '')
    if not luhn_check(card_number):
        return False
    
    # Validar data de expiração
    try:
        month = int(card_data['expiry_month'])
        year = int(card_data['expiry_year'])
        
        if month < 1 or month > 12:
            return False
        
        current_year = datetime.now().year
        if year < current_year or (year == current_year and month < datetime.now().month):
            return False
            
    except ValueError:
        return False
    
    return True

def luhn_check(card_number):
    """Algoritmo de Luhn para validar número do cartão"""
    def digits_of(n):
        return [int(d) for d in str(n)]
    
    digits = digits_of(card_number)
    odd_digits = digits[-1::-2]
    even_digits = digits[-2::-2]
    checksum = sum(odd_digits)
    
    for d in even_digits:
        checksum += sum(digits_of(d*2))
    
    return checksum % 10 == 0

def simulate_card_payment(transaction, card_data):
    """Simular processamento de pagamento com cartão"""
    # Simular diferentes cenários baseado no número do cartão
    card_number = card_data['number'].replace(' ', '').replace('-', '')
    
    # Cartões de teste
    if card_number.startswith('4111'):  # Visa aprovado
        return {
            'status': 'approved',
            'gateway_id': f'pg_{uuid.uuid4().hex[:16]}',
            'message': 'Pagamento aprovado'
        }
    elif card_number.startswith('4000'):  # Cartão recusado
        return {
            'status': 'failed',
            'error': 'Cartão recusado pelo banco emissor',
            'message': 'Pagamento recusado'
        }
    elif card_number.startswith('4242'):  # Cartão com análise
        return {
            'status': 'pending',
            'gateway_id': f'pg_{uuid.uuid4().hex[:16]}',
            'message': 'Pagamento em análise'
        }
    else:
        # Simular aprovação para outros cartões
        return {
            'status': 'approved',
            'gateway_id': f'pg_{uuid.uuid4().hex[:16]}',
            'message': 'Pagamento aprovado'
        }

def generate_pix_code(transaction):
    """Gerar código PIX"""
    # Em produção, integrar com API do banco
    return f"00020126580014BR.GOV.BCB.PIX0136{uuid.uuid4()}5204000053039865802BR5925Instituto Buriti LTDA6009SAO PAULO62070503***6304{uuid.uuid4().hex[:4].upper()}"

def generate_pix_qr_code(pix_code):
    """Gerar QR Code do PIX (retorna URL base64 simulada)"""
    # Em produção, gerar QR Code real
    return f"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="

def generate_boleto(transaction, data):
    """Gerar boleto bancário"""
    # Em produção, integrar com API do banco
    barcode = f"34191.79001 01043.510047 91020.150008 1 {(datetime.now() + timedelta(days=3)).strftime('%Y%m%d')}{int(transaction.amount * 100):010d}"
    
    return {
        'url': f'https://boleto.institutoburiti.com.br/{transaction.id}',
        'barcode': barcode
    }

def verify_pagseguro_webhook(request):
    """Verificar autenticidade do webhook do PagSeguro"""
    # Em produção, implementar verificação real
    return True

def verify_stripe_webhook(payload, sig_header):
    """Verificar assinatura do webhook do Stripe"""
    # Em produção, implementar verificação real com stripe.Webhook.construct_event
    return True

def query_pagseguro_transaction(notification_code):
    """Consultar status da transação no PagSeguro"""
    # Em produção, fazer requisição real para API do PagSeguro
    return {
        'transaction_id': 'pg_' + uuid.uuid4().hex[:16],
        'status': 'approved',
        'amount': 59.90
    }

def update_transaction_status(transaction_status):
    """Atualizar status da transação local"""
    transaction = Transaction.query.filter_by(
        gateway_transaction_id=transaction_status['transaction_id']
    ).first()
    
    if transaction:
        transaction.status = transaction_status['status']
        transaction.updated_at = datetime.utcnow()
        db.session.commit()
        
        # Se aprovado, processar assinatura
        if transaction_status['status'] == 'approved':
            handle_successful_payment(transaction, {})

def handle_stripe_event(event):
    """Processar eventos do Stripe"""
    if event['type'] == 'payment_intent.succeeded':
        # Pagamento aprovado
        payment_intent = event['data']['object']
        # Atualizar transação local
        pass
    elif event['type'] == 'payment_intent.payment_failed':
        # Pagamento falhou
        payment_intent = event['data']['object']
        # Atualizar transação local
        pass

def handle_successful_payment(transaction, data):
    """Processar pagamento aprovado"""
    try:
        # Ativar/criar assinatura se for pagamento de assinatura
        if transaction.user_id:
            subscription = Subscription.query.filter_by(
                user_id=transaction.user_id,
                status='pending'
            ).first()
            
            if subscription:
                subscription.status = 'active'
                subscription.activated_at = datetime.utcnow()
                subscription.updated_at = datetime.utcnow()
                db.session.commit()
        
        # Enviar email de confirmação (implementar)
        # send_payment_confirmation_email(transaction)
        
    except Exception as e:
        current_app.logger.error(f'Erro ao processar pagamento aprovado: {str(e)}')

@payments_bp.route('/admin/transactions', methods=['GET'])
def get_admin_transactions():
    """Listar transações para admin"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        status = request.args.get('status')
        
        query = Transaction.query
        
        if status:
            query = query.filter_by(status=status)
        
        transactions = query.order_by(Transaction.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'transactions': [{
                'id': t.id,
                'user_id': t.user_id,
                'amount': float(t.amount),
                'currency': t.currency,
                'payment_method': t.payment_method,
                'status': t.status,
                'gateway': t.gateway,
                'created_at': t.created_at.isoformat(),
                'gateway_transaction_id': t.gateway_transaction_id
            } for t in transactions.items],
            'total': transactions.total,
            'pages': transactions.pages,
            'current_page': page
        }), 200
        
    except Exception as e:
        current_app.logger.error(f'Erro ao listar transações: {str(e)}')
        return jsonify({'error': 'Erro interno do servidor'}), 500

@payments_bp.route('/admin/financial-stats', methods=['GET'])
def get_financial_stats():
    """Obter estatísticas financeiras para admin"""
    try:
        # Calcular estatísticas (em produção, otimizar queries)
        total_revenue = db.session.query(db.func.sum(Transaction.amount)).filter_by(status='approved').scalar() or 0
        total_transactions = Transaction.query.filter_by(status='approved').count()
        pending_transactions = Transaction.query.filter_by(status='pending').count()
        failed_transactions = Transaction.query.filter_by(status='failed').count()
        
        active_subscriptions = Subscription.query.filter_by(status='active').count()
        
        return jsonify({
            'total_revenue': float(total_revenue),
            'total_transactions': total_transactions,
            'pending_transactions': pending_transactions,
            'failed_transactions': failed_transactions,
            'active_subscriptions': active_subscriptions,
            'conversion_rate': (total_transactions / max(total_transactions + failed_transactions, 1)) * 100
        }), 200
        
    except Exception as e:
        current_app.logger.error(f'Erro ao obter estatísticas: {str(e)}')
        return jsonify({'error': 'Erro interno do servidor'}), 500

