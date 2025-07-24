"""
Payment Models - Instituto Buriti
Modelos para sistema de pagamentos, assinaturas e transações
"""

from ..database import db
from datetime import datetime
from decimal import Decimal
import uuid

class Payment(db.Model):
    """Modelo para pagamentos"""
    __tablename__ = 'payments'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    currency = db.Column(db.String(3), default='BRL')
    payment_method = db.Column(db.String(50), nullable=False)  # credit_card, pix, boleto
    status = db.Column(db.String(20), default='pending')  # pending, approved, failed, cancelled
    gateway = db.Column(db.String(50))  # pagseguro, stripe, etc
    gateway_transaction_id = db.Column(db.String(100))
    gateway_response = db.Column(db.Text)
    
    # Dados específicos por método
    pix_code = db.Column(db.Text)
    boleto_url = db.Column(db.String(500))
    boleto_barcode = db.Column(db.String(100))
    
    # Metadados
    customer_data = db.Column(db.Text)  # JSON com dados do cliente
    product_data = db.Column(db.Text)   # JSON com dados do produto
    failure_reason = db.Column(db.String(200))
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, onupdate=datetime.utcnow)
    expires_at = db.Column(db.DateTime)  # Para PIX e boleto
    
    # Relacionamentos
    user = db.relationship('User', backref='payments')
    
    def __repr__(self):
        return f'<Payment {self.id}: {self.amount} {self.currency} - {self.status}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'amount': float(self.amount),
            'currency': self.currency,
            'payment_method': self.payment_method,
            'status': self.status,
            'gateway': self.gateway,
            'gateway_transaction_id': self.gateway_transaction_id,
            'pix_code': self.pix_code,
            'boleto_url': self.boleto_url,
            'boleto_barcode': self.boleto_barcode,
            'failure_reason': self.failure_reason,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'expires_at': self.expires_at.isoformat() if self.expires_at else None
        }

class Subscription(db.Model):
    """Modelo para assinaturas"""
    __tablename__ = 'subscriptions'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    plan_type = db.Column(db.String(50), nullable=False)  # basic, premium, annual
    status = db.Column(db.String(20), default='pending')  # pending, active, cancelled, expired
    
    # Valores
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    currency = db.Column(db.String(3), default='BRL')
    payment_method = db.Column(db.String(50))
    
    # Datas de cobrança
    next_billing = db.Column(db.DateTime)
    last_billing = db.Column(db.DateTime)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    activated_at = db.Column(db.DateTime)
    cancelled_at = db.Column(db.DateTime)
    updated_at = db.Column(db.DateTime, onupdate=datetime.utcnow)
    
    # Relacionamentos
    user = db.relationship('User', backref='subscriptions')
    
    def __repr__(self):
        return f'<Subscription {self.id}: {self.user_id} - {self.plan_type} - {self.status}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'plan_type': self.plan_type,
            'status': self.status,
            'amount': float(self.amount),
            'currency': self.currency,
            'payment_method': self.payment_method,
            'next_billing': self.next_billing.isoformat() if self.next_billing else None,
            'last_billing': self.last_billing.isoformat() if self.last_billing else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'activated_at': self.activated_at.isoformat() if self.activated_at else None,
            'cancelled_at': self.cancelled_at.isoformat() if self.cancelled_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    @property
    def is_active(self):
        return self.status == 'active'
    
    @property
    def days_until_billing(self):
        if not self.next_billing:
            return None
        delta = self.next_billing - datetime.utcnow()
        return delta.days if delta.days > 0 else 0

class Transaction(db.Model):
    """Modelo para transações (herda de Payment mas com campos específicos)"""
    __tablename__ = 'transactions'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    
    # Dados da transação
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    currency = db.Column(db.String(3), default='BRL')
    payment_method = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(20), default='pending')
    
    # Gateway
    gateway = db.Column(db.String(50))
    gateway_transaction_id = db.Column(db.String(100))
    gateway_response = db.Column(db.Text)
    
    # Dados específicos
    pix_code = db.Column(db.Text)
    boleto_url = db.Column(db.String(500))
    boleto_barcode = db.Column(db.String(100))
    
    # Metadados
    customer_data = db.Column(db.Text)
    product_data = db.Column(db.Text)
    failure_reason = db.Column(db.String(200))
    
    # Relacionado a assinatura
    subscription_id = db.Column(db.Integer, db.ForeignKey('subscriptions.id'), nullable=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, onupdate=datetime.utcnow)
    expires_at = db.Column(db.DateTime)
    
    # Relacionamentos
    user = db.relationship('User', backref='transactions')
    subscription = db.relationship('Subscription', backref='transactions')
    
    def __repr__(self):
        return f'<Transaction {self.id}: {self.amount} {self.currency} - {self.status}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'amount': float(self.amount),
            'currency': self.currency,
            'payment_method': self.payment_method,
            'status': self.status,
            'gateway': self.gateway,
            'gateway_transaction_id': self.gateway_transaction_id,
            'pix_code': self.pix_code,
            'boleto_url': self.boleto_url,
            'boleto_barcode': self.boleto_barcode,
            'failure_reason': self.failure_reason,
            'subscription_id': self.subscription_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'expires_at': self.expires_at.isoformat() if self.expires_at else None
        }

class Coupon(db.Model):
    """Modelo para cupons de desconto"""
    __tablename__ = 'coupons'
    
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(50), unique=True, nullable=False)
    description = db.Column(db.String(200))
    
    # Tipo de desconto
    discount_type = db.Column(db.String(20), nullable=False)  # percentage, fixed
    discount_value = db.Column(db.Numeric(10, 2), nullable=False)
    
    # Restrições
    min_amount = db.Column(db.Numeric(10, 2), default=0)
    max_discount = db.Column(db.Numeric(10, 2))
    usage_limit = db.Column(db.Integer)
    usage_count = db.Column(db.Integer, default=0)
    
    # Validade
    valid_from = db.Column(db.DateTime, default=datetime.utcnow)
    valid_until = db.Column(db.DateTime)
    
    # Status
    is_active = db.Column(db.Boolean, default=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<Coupon {self.code}: {self.discount_value} {self.discount_type}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'code': self.code,
            'description': self.description,
            'discount_type': self.discount_type,
            'discount_value': float(self.discount_value),
            'min_amount': float(self.min_amount),
            'max_discount': float(self.max_discount) if self.max_discount else None,
            'usage_limit': self.usage_limit,
            'usage_count': self.usage_count,
            'valid_from': self.valid_from.isoformat() if self.valid_from else None,
            'valid_until': self.valid_until.isoformat() if self.valid_until else None,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def is_valid(self, amount=0):
        """Verificar se cupom é válido"""
        now = datetime.utcnow()
        
        # Verificar se está ativo
        if not self.is_active:
            return False, "Cupom inativo"
        
        # Verificar validade
        if self.valid_from and now < self.valid_from:
            return False, "Cupom ainda não é válido"
        
        if self.valid_until and now > self.valid_until:
            return False, "Cupom expirado"
        
        # Verificar limite de uso
        if self.usage_limit and self.usage_count >= self.usage_limit:
            return False, "Cupom esgotado"
        
        # Verificar valor mínimo
        if amount < self.min_amount:
            return False, f"Valor mínimo: R$ {self.min_amount:.2f}"
        
        return True, "Cupom válido"
    
    def calculate_discount(self, amount):
        """Calcular desconto para um valor"""
        if self.discount_type == 'percentage':
            discount = amount * (self.discount_value / 100)
        else:  # fixed
            discount = self.discount_value
        
        # Aplicar desconto máximo se definido
        if self.max_discount:
            discount = min(discount, self.max_discount)
        
        # Garantir que desconto não seja maior que o valor
        discount = min(discount, amount)
        
        return float(discount)

class PaymentMethod(db.Model):
    """Modelo para métodos de pagamento salvos do usuário"""
    __tablename__ = 'payment_methods'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Tipo e dados
    method_type = db.Column(db.String(50), nullable=False)  # credit_card, bank_account
    is_default = db.Column(db.Boolean, default=False)
    
    # Dados do cartão (tokenizados)
    card_token = db.Column(db.String(100))  # Token do gateway
    card_last_four = db.Column(db.String(4))
    card_brand = db.Column(db.String(20))  # visa, mastercard, etc
    card_holder_name = db.Column(db.String(100))
    
    # Dados da conta bancária
    bank_code = db.Column(db.String(10))
    bank_name = db.Column(db.String(100))
    account_type = db.Column(db.String(20))  # checking, savings
    account_last_four = db.Column(db.String(4))
    
    # Status
    is_active = db.Column(db.Boolean, default=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, onupdate=datetime.utcnow)
    
    # Relacionamentos
    user = db.relationship('User', backref='payment_methods')
    
    def __repr__(self):
        return f'<PaymentMethod {self.id}: {self.user_id} - {self.method_type}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'method_type': self.method_type,
            'is_default': self.is_default,
            'card_last_four': self.card_last_four,
            'card_brand': self.card_brand,
            'card_holder_name': self.card_holder_name,
            'bank_name': self.bank_name,
            'account_type': self.account_type,
            'account_last_four': self.account_last_four,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class Invoice(db.Model):
    """Modelo para faturas/recibos"""
    __tablename__ = 'invoices'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    transaction_id = db.Column(db.String(36), db.ForeignKey('transactions.id'), nullable=True)
    subscription_id = db.Column(db.Integer, db.ForeignKey('subscriptions.id'), nullable=True)
    
    # Dados da fatura
    invoice_number = db.Column(db.String(50), unique=True, nullable=False)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    currency = db.Column(db.String(3), default='BRL')
    status = db.Column(db.String(20), default='pending')  # pending, paid, cancelled
    
    # Datas
    issue_date = db.Column(db.DateTime, default=datetime.utcnow)
    due_date = db.Column(db.DateTime, nullable=False)
    paid_date = db.Column(db.DateTime)
    
    # Dados do cliente (snapshot)
    customer_name = db.Column(db.String(100))
    customer_email = db.Column(db.String(100))
    customer_document = db.Column(db.String(20))
    customer_address = db.Column(db.Text)
    
    # Itens da fatura (JSON)
    items = db.Column(db.Text)  # JSON com itens da fatura
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, onupdate=datetime.utcnow)
    
    # Relacionamentos
    user = db.relationship('User', backref='invoices')
    transaction = db.relationship('Transaction', backref='invoices')
    subscription = db.relationship('Subscription', backref='invoices')
    
    def __repr__(self):
        return f'<Invoice {self.invoice_number}: {self.amount} {self.currency} - {self.status}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'transaction_id': self.transaction_id,
            'subscription_id': self.subscription_id,
            'invoice_number': self.invoice_number,
            'amount': float(self.amount),
            'currency': self.currency,
            'status': self.status,
            'issue_date': self.issue_date.isoformat() if self.issue_date else None,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'paid_date': self.paid_date.isoformat() if self.paid_date else None,
            'customer_name': self.customer_name,
            'customer_email': self.customer_email,
            'customer_document': self.customer_document,
            'customer_address': self.customer_address,
            'items': self.items,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

