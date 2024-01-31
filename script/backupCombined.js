let selectedContactsPlaceholder = document.getElementById("selectedContactsPlaceholder");

  if (selectedContactsPlaceholder) {
    selectedContactsPlaceholder.innerHTML = "";

    for (let contact of selectedContactIcons) {
      let contactElement = document.createElement("div");

      let iconDiv = `<div class="self-made-icon" style="background-color: ${contact.color};">${contact.letter}</div>`;

      contactElement.innerHTML = `<div class="assigned-to-edit-contact">${iconDiv} ${contact.name}</div>`;
      selectedContactsPlaceholder.appendChild(contactElement);
    }
  }