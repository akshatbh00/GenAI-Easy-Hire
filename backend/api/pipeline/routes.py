# In routes.py (pipeline), change the move_stage endpoint:

@router.post("/move")
def move_stage(
    req: MoveStageRequest,
    db: Session = Depends(get_db),
    current_user=Depends(require_recruiter),   # ← add this
):
    try:
        app = svc.move_stage(
            req.application_id,
            req.to_stage,
            str(current_user.id),              # ← pass real recruiter id
            req.notes,
            db,
        )
        return {"stage": app.current_stage, "highest": app.highest_stage}
    except ValueError as e:
        raise HTTPException(404, str(e))