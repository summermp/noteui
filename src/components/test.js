      if (noteToEdit) {
        // Update existing note with categories
        await noteAPI.updateNote(noteToEdit.id, noteData);

        // Update categories
        const currentCategoryIds = new Set(noteToEdit.categories?.map(c => c.id) || []);

        // Add new categories
        for (const categoryId of selectedCategories) {
          if (!currentCategoryIds.has(categoryId)) {
            await noteAPI.addCategoryToNote(noteToEdit.id, categoryId);
          }
        }

        // Remove old categories
        for (const categoryId of currentCategoryIds) {
          if (!selectedCategories.has(categoryId)) {
            await noteAPI.removeCategoryFromNote(noteToEdit.id, categoryId);
          }
        }

        onCancelEdit?.();
      } else {
        // Create new note with categories
        const categoryNames = categories
          .filter(c => selectedCategories.has(c.id))
          .map(c => c.name);

        if (categoryNames.length > 0) {
          await noteAPI.createNoteWithCategories(noteData, categoryNames);
        } else {
          await noteAPI.createNote(noteData);
        }
      }
