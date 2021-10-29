import React, { useState } from "react";
import { useSelector } from "react-redux";
import { PlainButton, WarningBox } from "../styles/profile";
import { ethers } from "ethers";
import { Text } from "../styles/profile";

const MessageDisplay = (props) => {
  const [hidePost, setHidePost] = useState(true);

  const user = useSelector((state) => state.profile.user);
  const theme = useSelector((state) => state.theme);

  const { tweet } = props;

  const showPost = async () => {
    setHidePost(false);
  };

  let ongoingModeration = true;
  let displayAmount = "";
  if (!tweet.disputed) {
    if (tweet.moderations.length == 0) {
      ongoingModeration = false;
    } else {
      const moderation = tweet.moderations[0];
      if (moderation.closed) {
        ongoingModeration = false;
      } else if (Date.now() / 1000 < moderation.bondDeadline) {
        const amountPaid = moderation.rounds[0].amountPaid;
        const winningAmount = amountPaid[1] < amountPaid[2] ? amountPaid[2] : amountPaid[1];
        displayAmount = `$${ethers.utils.formatEther(ethers.BigNumber.from(winningAmount))}`;
      } else {
        // Market needs to be resolved
        ongoingModeration = moderation.currentWinner == "Reject";
      }
    }
  }

  if (tweet.disputed && hidePost) {
    const warningMessage = "Moderation dispute ongoing on Kleros."
    return (
        <WarningBox>
          <p>{warningMessage}</p>
        <PlainButton
          onClick={showPost}
          defaultBg={theme.defaultBg}
          darkBg={theme.darkBg}
        >
          Show
        </PlainButton>
        </WarningBox>
    );
  } else if (ongoingModeration && hidePost) {
    const warningMessage = "This post is being moderated."
    return (
        <WarningBox>
          <p>{warningMessage}</p>
        <PlainButton
          onClick={showPost}
          defaultBg={theme.defaultBg}
          darkBg={theme.darkBg}
        >
          Show
        </PlainButton>
        </WarningBox>
    );
  } else {
    return (
      <div style={{color: theme.color}}>{tweet.message}</div>
    );
  }
};

export default MessageDisplay;
