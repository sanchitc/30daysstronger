import { useEffect, useState } from "react";
import { loadExercises, getExercise, imageUrl } from "./exercises.js";

// Bottom sheet with the how-to for one exercise, straight from free-exercise-db.
export default function ExerciseSheet({ item, onClose }) {
  const [ex, setEx] = useState(() => getExercise(item.id));

  useEffect(() => {
    if (ex || !item.id) return;
    let alive = true;
    loadExercises().then(() => alive && setEx(getExercise(item.id)));
    return () => { alive = false; };
  }, [item.id, ex]);

  const tags = ex
    ? [ex.equipment, ...ex.primaryMuscles, ex.level, ex.mechanic].filter(Boolean)
    : [];

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-head">
          <div>
            <div className="sheet-title">{item.name}</div>
            {item.reps && <div className="ex-note">{item.reps} reps</div>}
          </div>
          <button className="sheet-close" onClick={onClose}>×</button>
        </div>

        <div className="sheet-body">
          {!item.id ? (
            <p className="p-status">No database entry for this one — do it your way.</p>
          ) : !ex ? (
            <p className="p-status">Loading…</p>
          ) : (
            <>
              <div className="sheet-tags">
                {tags.map((t, i) => <span key={i} className="tag">{t}</span>)}
              </div>

              {ex.images.length > 0 && (
                <div className="demo-imgs">
                  {ex.images.slice(0, 2).map((src) => (
                    <img
                      key={src}
                      src={imageUrl(src)}
                      alt=""
                      loading="lazy"
                      onError={(e) => { e.currentTarget.style.display = "none"; }}
                    />
                  ))}
                </div>
              )}

              <div className="steps">
                {ex.instructions.map((line, i) => (
                  <p key={i} className="step">
                    <span className="step-n">{i + 1}</span>
                    <span>{line}</span>
                  </p>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
