const fs = require("fs/promises");
const contactsPath = require("../../models/contacts/contactsPath");
const getAll = require("./getAll");

const updateContact = async (id, data) => {
  const contacts = await getAll();

  const updatedContactIndx = contacts.findIndex((item) => item.id === id);

  if (updatedContactIndx === -1) {
    return null;
  }

  const updatedContact = { id, ...data };
  contacts[updatedContactIndx] = updatedContact;
  await fs.writeFile(contactsPath, JSON.stringify(contacts, null, 3));

  return updatedContact;
};

module.exports = updateContact;
