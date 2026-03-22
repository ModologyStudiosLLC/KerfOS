"""Initial migration

Revision ID: 001
Revises: 
Create Date: 2026-03-22

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Users table
    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('email', sa.String(255), unique=True, nullable=False),
        sa.Column('password_hash', sa.String(255)),
        sa.Column('name', sa.String(255)),
        sa.Column('tier', sa.String(50), default='free'),
        sa.Column('stripe_customer_id', sa.String(255)),
        sa.Column('stripe_subscription_id', sa.String(255)),
        sa.Column('created_at', sa.DateTime, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime, server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    op.create_index('idx_users_email', 'users', ['email'])

    # Projects table
    op.create_table(
        'projects',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('description', sa.Text),
        sa.Column('created_at', sa.DateTime, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime, server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    op.create_index('idx_projects_user_id', 'projects', ['user_id'])

    # Cabinets table
    op.create_table(
        'cabinets',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('project_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('projects.id', ondelete='CASCADE'), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('width', sa.Numeric(10, 2), nullable=False),
        sa.Column('height', sa.Numeric(10, 2), nullable=False),
        sa.Column('depth', sa.Numeric(10, 2), nullable=False),
        sa.Column('material', sa.String(255), nullable=False),
        sa.Column('created_at', sa.DateTime, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime, server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    op.create_index('idx_cabinets_project_id', 'cabinets', ['project_id'])

    # Materials table
    op.create_table(
        'materials',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('type', sa.String(50), nullable=False),
        sa.Column('thickness', sa.Numeric(10, 2), nullable=False),
        sa.Column('price_per_sheet', sa.Numeric(10, 2), nullable=False),
        sa.Column('sheet_width', sa.Numeric(10, 2), default=48.0),
        sa.Column('sheet_height', sa.Numeric(10, 2), default=96.0),
        sa.Column('is_custom', sa.Boolean, default=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE')),
        sa.Column('created_at', sa.DateTime, server_default=sa.func.now()),
    )

    # Cut lists table
    op.create_table(
        'cut_lists',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('project_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('projects.id', ondelete='CASCADE')),
        sa.Column('cabinet_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('cabinets.id', ondelete='CASCADE')),
        sa.Column('cuts', postgresql.JSONB, nullable=False),
        sa.Column('total_parts', sa.Integer),
        sa.Column('material_cost', sa.Numeric(10, 2)),
        sa.Column('generated_at', sa.DateTime, server_default=sa.func.now()),
    )
    op.create_index('idx_cut_lists_project_id', 'cut_lists', ['project_id'])

    # Usage events table
    op.create_table(
        'usage_events',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('event_type', sa.String(50), nullable=False),
        sa.Column('resource_type', sa.String(50), nullable=False),
        sa.Column('created_at', sa.DateTime, server_default=sa.func.now()),
    )
    op.create_index('idx_usage_events_user_id', 'usage_events', ['user_id'])
    op.create_index('idx_usage_events_created_at', 'usage_events', ['created_at'])

    # Insert default materials
    op.bulk_insert(
        sa.table(
            'materials',
            sa.Column('id', postgresql.UUID(as_uuid=True)),
            sa.Column('name', sa.String),
            sa.Column('type', sa.String),
            sa.Column('thickness', sa.Numeric),
            sa.Column('price_per_sheet', sa.Numeric),
            sa.Column('sheet_width', sa.Numeric),
            sa.Column('sheet_height', sa.Numeric),
            sa.Column('is_custom', sa.Boolean),
            sa.Column('user_id', postgresql.UUID(as_uuid=True)),
            sa.Column('created_at', sa.DateTime),
        ),
        [
            {
                'id': '11111111-1111-1111-1111-111111111111',
                'name': '3/4" Birch Plywood',
                'type': 'plywood',
                'thickness': 0.75,
                'price_per_sheet': 75.00,
                'sheet_width': 48.0,
                'sheet_height': 96.0,
                'is_custom': False,
                'user_id': None,
                'created_at': sa.func.now()
            },
            {
                'id': '22222222-2222-2222-2222-222222222222',
                'name': '1/2" Birch Plywood',
                'type': 'plywood',
                'thickness': 0.5,
                'price_per_sheet': 55.00,
                'sheet_width': 48.0,
                'sheet_height': 96.0,
                'is_custom': False,
                'user_id': None,
                'created_at': sa.func.now()
            },
            {
                'id': '33333333-3333-3333-3333-333333333333',
                'name': '3/4" MDF',
                'type': 'mdf',
                'thickness': 0.75,
                'price_per_sheet': 45.00,
                'sheet_width': 49.0,
                'sheet_height': 97.0,
                'is_custom': False,
                'user_id': None,
                'created_at': sa.func.now()
            },
            {
                'id': '44444444-4444-4444-4444-444444444444',
                'name': '3/4" Oak Plywood',
                'type': 'plywood',
                'thickness': 0.75,
                'price_per_sheet': 95.00,
                'sheet_width': 48.0,
                'sheet_height': 96.0,
                'is_custom': False,
                'user_id': None,
                'created_at': sa.func.now()
            },
            {
                'id': '55555555-5555-5555-5555-555555555555',
                'name': '3/4" Maple Plywood',
                'type': 'plywood',
                'thickness': 0.75,
                'price_per_sheet': 85.00,
                'sheet_width': 48.0,
                'sheet_height': 96.0,
                'is_custom': False,
                'user_id': None,
                'created_at': sa.func.now()
            }
        ]
    )


def downgrade() -> None:
    op.drop_table('usage_events')
    op.drop_table('cut_lists')
    op.drop_table('materials')
    op.drop_table('cabinets')
    op.drop_table('projects')
    op.drop_table('users')
