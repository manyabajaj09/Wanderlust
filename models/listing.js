const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,

  image: {
  type: {
    filename: String,
    url: String,
  },
  default: {
    url: "https://unsplash.com/photos/brown-wooden-house-covered-with-snow-near-green-trees-during-daytime-j8ohzZklQ5k"
  }
}
,

  price: Number,
  location: String,
  country: String,
  reviews:[
    {
      type:Schema.Types.ObjectId,
      ref:"Review"
    }
  ]
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
