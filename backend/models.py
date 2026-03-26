# ── Add this at the bottom of your existing models.py ─────────────────────

class InAppNotification(Base):
    __tablename__ = "notifications"
    id             = uuid_pk()
    user_id        = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    application_id = Column(UUID(as_uuid=True), ForeignKey("applications.id"), nullable=True)
    stage          = Column(String, nullable=True)
    message        = Column(Text)
    is_read        = Column(Boolean, default=False)
    created_at = now()
    