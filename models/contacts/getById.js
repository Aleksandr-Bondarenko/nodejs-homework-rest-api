const getAll = require("./getAll");

const getContactById = async (id) => {
  const contacts = await getAll();
  const soughtContact = contacts.find((item) => item.id === id);
  if (!soughtContact) {
    return null;
  }

  return soughtContact;
};

module.exports = getContactById;
