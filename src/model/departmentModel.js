const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Business",
    },
    department: {
      type: String,
    },
    id:{}
  },
  { timestamps: true }
);

departmentSchema.method("toJSON", function () {
  const { _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

const Department = mongoose.model("Department", departmentSchema);

// export default Department;
exports.Department = Department;
