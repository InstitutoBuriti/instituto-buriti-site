from datetime import datetime, timedelta
from src.models.user import db, User, UserNote
from src.models.course import Course, Enrollment, Activity, ActivitySubmission, Announcement

def seed_database():
    """Popula o banco de dados com dados de teste"""
    try:
        print("🌱 Iniciando seed do banco de dados...")
        
        # Criar cursos de teste
        create_test_courses()
        
        # Criar matrículas de teste
        create_test_enrollments()
        
        # Criar atividades de teste
        create_test_activities()
        
        # Criar submissões de teste
        create_test_submissions()
        
        # Criar anúncios de teste
        create_test_announcements()
        
        # Criar anotações de teste
        create_test_notes()
        
        db.session.commit()
        print("✅ Seed do banco de dados concluído com sucesso!")
        
    except Exception as e:
        print(f"❌ Erro no seed do banco: {e}")
        db.session.rollback()

def create_test_courses():
    """Cria cursos de teste"""
    # Buscar instrutor
    instrutor = User.query.filter_by(email='prof.joao@teste.com').first()
    if not instrutor:
        return
    
    courses_data = [
        {
            'title': 'Desenvolvimento Web Completo',
            'description': 'Curso completo de desenvolvimento web com HTML, CSS, JavaScript, React e Node.js. Aprenda a criar aplicações web modernas e responsivas.',
            'short_description': 'Domine o desenvolvimento web do frontend ao backend',
            'category': 'Tecnologias',
            'level': 'Intermediário',
            'duration_hours': 120,
            'price': 299.90,
            'is_free': False,
            'has_certificate': True,
            'image_url': '/images/desenvolvimento-web.jpg',
            'is_published': True,
            'is_featured': True
        },
        {
            'title': 'Gestão Cultural e Projetos Sociais',
            'description': 'Aprenda a gerenciar projetos culturais e sociais, desde a concepção até a execução. Inclui captação de recursos, gestão de equipes e avaliação de impacto.',
            'short_description': 'Gestão eficiente de projetos culturais e sociais',
            'category': 'Gestão',
            'level': 'Iniciante',
            'duration_hours': 80,
            'price': 199.90,
            'is_free': False,
            'has_certificate': True,
            'image_url': '/images/gestao-cultural.jpg',
            'is_published': True,
            'is_featured': False
        },
        {
            'title': 'Inteligência Artificial para Iniciantes',
            'description': 'Introdução à Inteligência Artificial e Machine Learning. Conceitos fundamentais, aplicações práticas e ferramentas modernas.',
            'short_description': 'Primeiros passos no mundo da IA',
            'category': 'Tecnologias',
            'level': 'Iniciante',
            'duration_hours': 60,
            'price': 0.0,
            'is_free': True,
            'has_certificate': True,
            'image_url': '/images/ia-iniciantes.jpg',
            'is_published': True,
            'is_featured': True
        }
    ]
    
    for course_data in courses_data:
        existing_course = Course.query.filter_by(title=course_data['title']).first()
        if not existing_course:
            course = Course(
                instructor_id=instrutor.id,
                **course_data
            )
            db.session.add(course)

def create_test_enrollments():
    """Cria matrículas de teste"""
    aluno = User.query.filter_by(email='ana.silva@teste.com').first()
    if not aluno:
        return
    
    courses = Course.query.all()
    
    for i, course in enumerate(courses[:2]):  # Matricular em 2 cursos
        existing_enrollment = Enrollment.query.filter_by(
            student_id=aluno.id, 
            course_id=course.id
        ).first()
        
        if not existing_enrollment:
            enrollment = Enrollment(
                student_id=aluno.id,
                course_id=course.id,
                progress_percentage=65.0 if i == 0 else 40.0,
                enrolled_at=datetime.utcnow() - timedelta(days=30-i*10)
            )
            db.session.add(enrollment)

def create_test_activities():
    """Cria atividades de teste"""
    courses = Course.query.all()
    
    activities_data = [
        {
            'title': 'Quiz: Fundamentos de HTML',
            'description': 'Teste seus conhecimentos sobre HTML básico',
            'activity_type': 'quiz',
            'due_date': datetime.utcnow() + timedelta(days=7),
            'max_score': 10.0
        },
        {
            'title': 'Projeto: Página Pessoal',
            'description': 'Crie sua própria página pessoal usando HTML e CSS',
            'activity_type': 'assignment',
            'due_date': datetime.utcnow() + timedelta(days=14),
            'max_score': 10.0
        },
        {
            'title': 'Fórum: Discussão sobre JavaScript',
            'description': 'Participe da discussão sobre as melhores práticas em JavaScript',
            'activity_type': 'forum',
            'due_date': None,
            'max_score': 5.0
        }
    ]
    
    for course in courses:
        for activity_data in activities_data:
            existing_activity = Activity.query.filter_by(
                course_id=course.id,
                title=activity_data['title']
            ).first()
            
            if not existing_activity:
                activity = Activity(
                    course_id=course.id,
                    **activity_data
                )
                db.session.add(activity)

def create_test_submissions():
    """Cria submissões de teste"""
    aluno = User.query.filter_by(email='ana.silva@teste.com').first()
    instrutor = User.query.filter_by(email='prof.joao@teste.com').first()
    
    if not aluno or not instrutor:
        return
    
    activities = Activity.query.join(Course).join(Enrollment).filter(
        Enrollment.student_id == aluno.id
    ).all()
    
    for i, activity in enumerate(activities[:3]):  # Submeter 3 atividades
        existing_submission = ActivitySubmission.query.filter_by(
            activity_id=activity.id,
            student_id=aluno.id
        ).first()
        
        if not existing_submission:
            submission = ActivitySubmission(
                activity_id=activity.id,
                student_id=aluno.id,
                content=f'Resposta da atividade: {activity.title}',
                submitted_at=datetime.utcnow() - timedelta(days=5-i),
                score=8.5 if i < 2 else None,  # 2 corrigidas, 1 pendente
                feedback='Excelente trabalho!' if i < 2 else None,
                graded_at=datetime.utcnow() - timedelta(days=3-i) if i < 2 else None,
                graded_by=instrutor.id if i < 2 else None
            )
            db.session.add(submission)

def create_test_announcements():
    """Cria anúncios de teste"""
    admin = User.query.filter_by(email='admin@institutoburiti.com').first()
    instrutor = User.query.filter_by(email='prof.joao@teste.com').first()
    
    if not admin or not instrutor:
        return
    
    announcements_data = [
        {
            'title': 'Bem-vindos ao Instituto Buriti!',
            'content': 'Estamos muito felizes em tê-los conosco. Aproveitem ao máximo nossa plataforma de ensino.',
            'author_id': admin.id,
            'target_audience': 'all',
            'is_urgent': False
        },
        {
            'title': 'Manutenção Programada',
            'content': 'Haverá manutenção no sistema no próximo domingo das 2h às 6h.',
            'author_id': admin.id,
            'target_audience': 'all',
            'is_urgent': True,
            'expires_at': datetime.utcnow() + timedelta(days=7)
        },
        {
            'title': 'Nova Aula ao Vivo: JavaScript Avançado',
            'content': 'Não percam nossa aula ao vivo sobre JavaScript avançado na próxima terça-feira às 19h.',
            'author_id': instrutor.id,
            'target_audience': 'students',
            'is_urgent': False
        }
    ]
    
    for announcement_data in announcements_data:
        existing_announcement = Announcement.query.filter_by(
            title=announcement_data['title']
        ).first()
        
        if not existing_announcement:
            announcement = Announcement(**announcement_data)
            db.session.add(announcement)

def create_test_notes():
    """Cria anotações de teste"""
    aluno = User.query.filter_by(email='ana.silva@teste.com').first()
    if not aluno:
        return
    
    notes_data = [
        {
            'title': 'Conceitos importantes de HTML',
            'content': 'Tags semânticas: header, nav, main, section, article, aside, footer. Sempre usar estrutura semântica para melhor acessibilidade.',
            'is_private': True
        },
        {
            'title': 'Ideias para projeto final',
            'content': 'Criar um portfólio pessoal com: página inicial, sobre mim, projetos, contato. Usar CSS Grid e Flexbox para layout responsivo.',
            'is_private': True
        },
        {
            'title': 'Dúvidas para tirar com o professor',
            'content': '1. Como implementar animações CSS? 2. Qual a diferença entre let, const e var? 3. Como usar APIs REST?',
            'is_private': True
        }
    ]
    
    for note_data in notes_data:
        existing_note = UserNote.query.filter_by(
            user_id=aluno.id,
            title=note_data['title']
        ).first()
        
        if not existing_note:
            note = UserNote(
                user_id=aluno.id,
                **note_data
            )
            db.session.add(note)

