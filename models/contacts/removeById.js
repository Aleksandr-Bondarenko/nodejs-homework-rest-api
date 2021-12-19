const fs = require("fs").promises;
const contactsPath = require("../../models/contacts/contactsPath");
const getAll = require("./getAll");

const removeContact = async (id) => {
  const contacts = await getAll();
  const updateContacts = contacts.filter((item) => item.id !== id);
  await fs.writeFile(contactsPath, JSON.stringify(updateContacts, null, 3));
  if (contacts.length === updateContacts.length) {
    return null;
  }
  return { message: "contact deleted" };
};

module.exports = removeContact;
