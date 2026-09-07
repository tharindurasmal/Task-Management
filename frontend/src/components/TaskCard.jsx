import { Draggable } from '@hello-pangea/dnd';
import { getInitials, getAvatarColor } from '../utils/avatar';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function TaskCard({ task, index, currentUserId, onClaim }) {
  const isUnassigned = !task.assignedTo;
  const isMine = task.assignedTo?._id === currentUserId;
  const assigneeName = task.assignedTo?.name;

  return (
    <Draggable draggableId={task._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`task-card ${snapshot.isDragging ? 'task-card-dragging' : ''}`}
        >
<p className={`task-title ${task.status === 'done' ? 'task-title-done' : ''}`}>{task.title}</p>
          <span className={`tag-pill ${isUnassigned ? 'tag-pill-open' : ''}`}>
            {isUnassigned ? 'Unassigned' : assigneeName}
          </span>

          {task.description && <p className="task-description">{task.description}</p>}

          <div className="task-footer">
            <div className="task-footer-left">
              <span className={`status-dot status-dot-${task.status}`} />
              <span className="task-date">{formatDate(task.createdAt)}</span>
            </div>

            {isUnassigned ? (
              <button className="btn-claim" onClick={() => onClaim(task._id)}>
                Claim
              </button>
            ) : (
              <div
                className="avatar-circle avatar-circle-sm"
                style={{ background: getAvatarColor(assigneeName) }}
                title={isMine ? 'Assigned to you' : `Assigned to ${assigneeName}`}
              >
                {getInitials(assigneeName)}
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}
