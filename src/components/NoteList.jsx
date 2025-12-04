import React from 'react';
import NoteItem from './NoteItem';

const NoteList = ({ 
  notes, 
  onUpdateNote, 
  onDeleteNote, 
  onArchiveNote, 
  categories,
  onAddCategoryToNote,
  onRemoveCategoryFromNote
}) => {
  return (
    <div className="note-list">
      <h2>Active Notes ({notes.length})</h2>
      {notes.length === 0 ? (
        <p className="no-notes">No active notes found.</p>
      ) : (
        <div className="notes-grid">
          {notes.map(note => (
            <NoteItem
              key={note.id}
              note={note}
              onUpdateNote={onUpdateNote}
              onDeleteNote={onDeleteNote}
              onArchiveNote={onArchiveNote}
              categories={categories}
              onAddCategoryToNote={onAddCategoryToNote}
              onRemoveCategoryFromNote={onRemoveCategoryFromNote}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default NoteList;