import React from "react";
import jwt from "jsonwebtoken";
import { useSelector } from "react-redux";
import { Route, Redirect } from "react-router-dom";

const PrivateRoute = (props) => {
  const { homeAuthenticated } = props;
  const account = useSelector((state) => state.profile.user.account);
  let isAuthenticated = false;
  try {
    if (account !== undefined) {
      isAuthenticated = true;
    } else {
      isAuthenticated = false;
    }
  } catch (err) {
    isAuthenticated = false;
  }

  if (homeAuthenticated)
    return isAuthenticated ? (
      <Redirect to={{ pathname: "/home" }} />
    ) : (
      <Route {...props} />
    );

  return isAuthenticated ? (
    <Route {...props} />
  ) : (
    <Redirect to={{ pathname: "/" }} />
  );
};

export default PrivateRoute;
