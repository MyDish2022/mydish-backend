const SectionService = require("../services/SectionService");
const { success, error } = require("../middlewares/response");
const sectionAdd = (req, res, next) => {
  new SectionService()
    .sectionAdd(req.body)
    .then((info) =>
      res.status(200).json(success("SECTION_CREATE", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const sectionEdit = (req, res, next) => {
  new SectionService()
    .sectionEdit(req.body)
    .then((info) =>
      res.status(200).json(success("SECTION_UPDATE", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const getAllSections = (req, res, next) => {
  new SectionService()
    .getAllSections()
    .then((info) =>
      res.status(200).json(success("SECTION_LIST", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
module.exports = {
  sectionAdd,
  sectionEdit,
  getAllSections,
};
