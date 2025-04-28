const express = require("express");
const Joi = require('joi');
const app = express();
const ExpressError = require("./utils/ExpressError");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const review = require("./models/review.js");
const wrapAsync = require("./utils/wrapAsync.js");
const path = require("path");
const ejsMate = require("ejs-mate");
const { listingSchema, reviewSchema } = require("./schema.js");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "/public")));
app.engine('ejs', ejsMate);

const mongourl = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/wanderlust';

async function main() {
    await mongoose.connect(mongourl);
}
main().then(() => {
    console.log("connected to db");
}).catch((err) => {
    console.log(err);
});

app.listen(3000, () => {
    console.log("server is listening on port 3000");
});

// Custom validation middleware for review
const validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(".");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

// Listings Routes
app.get("/listings", async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
});

app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs");
});

app.get("/listings/:id", async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        return res.status(404).send("Listing not found");
    }
    res.render("listings/show.ejs", { listing });
});

// Create Listing
app.post("/listings", wrapAsync(async (req, res) => {
    const { error } = listingSchema.validate(req.body);
    if (error) throw new ExpressError(400, error.details.map((el) => el.message).join("."));
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
}));

// Edit Listing
app.get("/listings/:id/edit", async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
});

// Update Listing
app.put("/listings/:id", async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);
});

// Delete Listing
app.delete("/listings/:id", async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
});

// Add Review to Listing
app.post("/listings/:id/reviews", validateReview, wrapAsync(async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new review(req.body.review);
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    res.redirect(`/listings/${listing._id}`);
}));

// Global Error Handling Middleware
app.use((err, req, res, next) => {
    // Default to a 500 status code if the error doesn't have one
    let { statusCode = 500, message = "Something went wrong!" } = err;

    // Check if the error is an instance of ExpressError
    if (err instanceof ExpressError) {
        return res.status(statusCode).json({ error: message });
    }
    // Otherwise, send a generic 500 error message
    return res.status(statusCode).json({ error: "Internal Server Error" });
});

