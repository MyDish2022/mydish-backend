const RatingModel = require("../models/RatingModel");
const restaurant = require("../models/RestaurantModel");
const { AuthorizationError, NotFoundError } = require("../errors/appError");
class RatingService {
  constructor() {}
  async Add(user, body) {
    try {
      let userData = body;
      userData = { ...userData, user: user._id };
      const addedRating = new RatingModel(userData);
      console.log(addedRating);
      await addedRating.save();
      return addedRating;
    } catch (error) {
      throw error;
    }
  }
  async getAllRatings() {
    const projection = {
      restaurant: true,
      comment: true,
      detail: true,
      user: true,
      globalRating: true,
      updatedAt: true,
    };
    try {
      const rating = await RatingModel.find({}, projection)
        .populate("user", { firstName: 1, lastName: 1 })
        .populate("restaurant");
      return rating;
    } catch (error) {
      throw error;
    }
  }
  async getRestaurantRatings({ restaurant, query }) {
    const { date, range } = query;
    let sorts = null;
    if (range) sorts = range === "negative" ? 1 : -1;
    let filterQuery = { restaurant: restaurant._id };
    if (date) {
      let today = new Date();
      filterQuery =
        date === "oldest"
          ? { ...filterQuery, updatedAt: { $lte: today } }
          : { ...filterQuery, updatedAt: { $gte: today } };
    }
    //if (range) {
    // filterQuery =
    //   range === "negative"
    //     ? { ...filterQuery, globalRating: { $lte: 5 } }
    //     : { ...filterQuery, globalRating: { $gte: 5 } };
    //}
    const projection = {
      comment: true,
      detail: true,
      user: true,
      globalRating: true,
      updatedAt: true,
      createdAt: true,
    };
    try {
      if (range) {
        const rating = await RatingModel.find(filterQuery, projection)
          .populate("user", {
            firstName: 1,
            lastName: 1,
          })
          .sort({ globalRating: sorts });
        return rating;
      }
      const rating = await RatingModel.find(filterQuery, projection).populate(
        "user",
        {
          firstName: 1,
          lastName: 1,
        }
      );
      return rating;
    } catch (error) {
      throw error;
    }
  }
  async getMyRatingList(user) {
    const projection = {
      restaurant: true,
      comment: true,
      detail: true,
      user: true,
      globalRating: true,
      updatedAt: true,
    };
    try {
      const rating = await RatingModel.find({ user: user._id }, projection)
        .populate("user", { firstName: 1 })
        .populate("restaurant");
      return rating;
    } catch (error) {
      throw error;
    }
  }
  async getRatingInfos({ ratingId }) {
    try {
      const rating = await RatingModel.findOne({ _id: ratingId }).populate(
        "restaurant"
      );
      return rating;
    } catch (error) {
      throw error;
    }
  }
  async updateRating({ ratingId }, body) {
    try {
      const rating = await RatingModel.findByIdAndUpdate(
        { _id: ratingId },
        {
          $set: body,
        },
        { returnOriginal: false }
      );
      return rating
        ? rating
        : new NotFoundError(`rating not found with id${req.body.id}`);
    } catch (error) {
      throw error;
    }
  }
  async deleteRating(RatingId) {
    try {
      await RatingModel.findByIdAndRemove({ _id: RatingId });
      return "rating deleted successfully";
    } catch (error) {
      throw error;
    }
  }
  async removeRatings(ratingsToRemove) {
    try {
      const promise = ratingsToRemove.map(async (rate) => {
        await RatingModel.findByIdAndRemove({ _id: rate });
      });
      await Promise.all(promise);
      return "rating removed successfully";
    } catch (error) {
      throw error;
    }
  }
}
module.exports = RatingService;
