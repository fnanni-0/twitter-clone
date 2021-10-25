import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import UploadButton from "../uploadButton";
import { Flex, Button } from "../styles/modal";
import { SET_UPDATE } from "../../redux/actions";
import { ethers } from "ethers";
import { toast } from "react-toastify";
import socialContractAbi from "../../abi/Social.json";
import arbitratorContractAbi from "../../abi/Arbitrator.json";
import POHContractAbi from "../../abi/ProofOfHumanity.json";
import { socialAddress, arbitratorAddress, POHAddress } from "../../contracts";
import makeBlockie from 'ethereum-blockies-base64';

const URL = process.env.REACT_APP_SERVER_URL;

const CommentModal = (props) => {
  const [text, setText] = useState("");
  const [isCommentDisabled, setIsCommentDisabled] = useState(true);
  const [preview, setPreview] = useState({ image: "", video: "", media: null });

  const user = useSelector((state) => state.profile.user);
  const theme = useSelector((state) => state.theme);
  const dispatch = useDispatch();

  const { handleClose, rows, tweetId, threadAuthor } = props;

  const addComment = async () => {
    setIsCommentDisabled(true);
    // preview.media preview.video preview.image
    const social = new ethers.Contract(socialAddress, socialContractAbi, user.signer);
    const arbitrator = new ethers.Contract(arbitratorAddress, arbitratorContractAbi, user.signer);
    const poh = new ethers.Contract(POHAddress, POHContractAbi, user.signer);
    
    const isFollower = await social.following(threadAuthor, user.account);
    if (user.account != threadAuthor && !isFollower) {
      // Deposit required.
      const extraData = await social.arbitratorExtraData();
      const arbitrationCost = await arbitrator.arbitrationCost(extraData);
      const totalCost = arbitrationCost.mul(3).div(2);
  
      let commentDeposit;
      const isHuman = await poh.isRegistered(user.account);
      if (isHuman) {
        commentDeposit = totalCost.div(16);
      } else {
        commentDeposit = totalCost.div(2);
      }
      await social.commentPost(tweetId, text, {
        value: commentDeposit
      });
    } else {
      await social.commentPost(tweetId, text);
    }

    setIsCommentDisabled(false);
    setText("");
    setPreview({ image: "", video: "", media: null });
    toast("Reply submitted!");
    dispatch({ type: SET_UPDATE });
    handleClose && handleClose();
  };

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    const url = reader.readAsDataURL(file);
    const isImage = file.type.includes("image");

    reader.onloadend = () => {
      isImage
        ? setPreview({ image: reader.result, video: "", media: file })
        : setPreview({ image: "", video: reader.result, media: file });
    };
  };

  return (
    <Flex bg={theme.bg} color={theme.color}>
      <div>
        <img
          src={makeBlockie(user.account)}
          width="49px"
          height="49px"
          style={{ borderRadius: "50%" }}
        />
      </div>
      <div style={{ width: "100%" }}>
        <textarea
          rows={rows || 5}
          placeholder="Tweet your reply"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            e.target.value
              ? setIsCommentDisabled(false)
              : setIsCommentDisabled(true);
          }}
        ></textarea>
        <div style={{ marginBottom: "10px" }}>
          {preview.image && (
            <img src={preview.image} style={{ width: "100%" }} />
          )}
          {preview.video && (
            <video
              src={preview.video}
              style={{ width: "100%" }}
              controls
            ></video>
          )}
        </div>
        <Flex style={{ alignItems: "center", justifyContent: "flex-end" }}>
          <div>
            <label htmlFor="photo">
              <UploadButton />
            </label>
            <input
              type="file"
              id="photo"
              name="photo"
              accept="image/*,video/*"
              onChange={handlePhoto}
              style={{ display: "none" }}
            />
          </div>
          <div>
            <Button
              onClick={addComment}
              disabled={isCommentDisabled}
              defaultBg={theme.defaultBg}
              darkBg={theme.darkBg}
            >
              Reply
            </Button>
          </div>
        </Flex>
      </div>
    </Flex>
  );
};

export default CommentModal;