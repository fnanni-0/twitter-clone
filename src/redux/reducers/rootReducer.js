import { combineReducers } from "redux";
import { reducer as formReducer } from "redux-form";
import profile from "./profile";
import update from "./update";
import theme from "./theme";
import { LOGOUT_USER } from "../actions";

const appReducer = combineReducers({
  profile,
  update,
  theme,
  form: formReducer,
});

const rootReducer = (state, action) => {
  switch (action.type) {
    case LOGOUT_USER:
      return {
        ...state,
        profile: {
          user: {},
        },
        theme: {
          mode: "default",
          bg: "rgb(0,0,0)",
          color: "rgb(255,255,255)",
          lightBg: "rgba(29,161,242,1)",
          darkBg: "rgb(26,145,218)",
          defaultBg: "rgb(29,161,242)",
          opaqueBg: "rgba(29, 161, 242, 0.1)",
          border: "rgb(47, 51, 54)",
          tweetHov: "rgb(21, 24, 28)",
          para: "rgb(110, 118, 125)",
          modalBg: "rgba(110, 118, 125, 0.4)",
          boxShadow:
            "rgba(255, 255, 255, 0.2) 0px 0px 15px, rgba(255, 255, 255, 0.15) 0px 0px 3px 1px",
        },
      };
    default:
      return appReducer(state, action);
  }
};

export default rootReducer;
