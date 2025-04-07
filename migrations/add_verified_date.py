from alembic import op
import sqlalchemy as sa

def upgrade():
    op.add_column('reports', sa.Column('verified_date', sa.DateTime(), nullable=True))

def downgrade():
    op.drop_column('reports', 'verified_date')