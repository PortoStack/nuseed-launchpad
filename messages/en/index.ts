import matching from "./matching.json";
import tagReview from "./tagReview.json";
import requirement from "./requirement.json";
import funding from "./funding.json";
import people from "./people.json";
import businessLifecycle from "./businessLifecycle.json";
import sidebar from "./sidebar.json";
import auth from "./auth.json";
import notifications from "./notifications.json";
import profile from "./profile.json";
import dashboard from "./dashboard.json";

const messages = {
  ...matching,
  ...tagReview,
  ...requirement,
  ...funding,
  ...people,
  ...businessLifecycle,
  ...sidebar,
  ...auth,
  ...notifications,
  ...profile,
  ...dashboard,
  common: {
    appName: "NU SEED Launchpad",
    all: "All",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    search: "Search...",
    noData: "No data found",
    loading: "Loading...",
    tagMatching: "Tag Matching",
    tagReview: "Tag Review & Catalog",
  },
};

export default messages;
