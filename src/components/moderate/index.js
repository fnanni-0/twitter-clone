import React from "react";
import { useSelector } from "react-redux";
import { ProfileCorner, Header } from "../styles/common";

const ModeratorHome = () => {
  const user = useSelector((state) => state.profile.user);
  const theme = useSelector((state) => state.theme);
  return (
    <ProfileCorner border={theme.border}>
      <Header color={theme.color} border={theme.border} para={theme.para}>
        <h2>Moderate</h2>
      </Header>
      <h2 style={{ textAlign: "center", color: theme.color }}>Coming soon!</h2>
    </ProfileCorner>
  );
};

export default ModeratorHome;
