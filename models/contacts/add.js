const { v4: uuidv4 } = require("uuid");
const fs = require("fs").promises;
const contactsPath = require("../../models/contacts/contactsPath");
const getAll = require("./getAll");

const addContact = async (data) => {
  // const { name, email, phone } = data;
  // const schema = Joi.object({
  //   name: Joi.string().min(2).required(),
  //   email: Joi.string()
  //     .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
  //     .required(),
  //   phone: Joi.string().required(),
  // });

  // const { value } = schema.validate({
  //   name: name,
  //   email: email,
  //   phone: phone,
  // });

  // console.log(value);

  // const isValid = await schema.validateAsync(value);
  // console.log(isValid);

  // if (isValid) {
  //   const newContact = { ...data, id: uuidv4() };
  //   const contacts = await getAll();
  //   contacts.push(newContact);
  //   await fs.writeFile(contactsPath, JSON.stringify(contacts, null, 3));

  //   return newContact;
  // }
  // return null;

  const newContact = { ...data, id: uuidv4() };
  const contacts = await getAll();
  contacts.push(newContact);
  await fs.writeFile(contactsPath, JSON.stringify(contacts, null, 3));

  return newContact;
};

module.exports = addContact;
