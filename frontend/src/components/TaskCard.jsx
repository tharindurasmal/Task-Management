import { Draggable } from '@hello-pangea/dnd';

export default function TaskCard({ task, index, currentUserId, onClaim }) {
  const isUnassigned = !task.assignedTo;
  const isMine = task.assignedTo?._id === currentUserId;

  return (
    <Draggable draggableId={task._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`task-card ${snapshot.isDragging ? 'task-card-dragging' : ''}`}
        >
          <p className="task-title">{task.title}</p>
          {task.description && <p className="task-description">{task.description}</p>}
          <div className="task-meta">
            <span className={`task-badge ${isUnassigned ? 'task-badge-open' : isMine ? 'task-badge-mine' : ''}`}>
              {isUnassigned ? 'Unassigned' : isMine ? 'Assigned to you' : `Assigned to ${task.assignedTo?.name}`}
            </span>
            {isUnassigned && (
              <button className="btn-claim" onClick={() => onClaim(task._id)}>
                Claim
              </button>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}
