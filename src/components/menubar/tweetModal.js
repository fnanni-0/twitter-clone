import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import UploadButton from "../uploadButton";
import { Flex, Button } from "../styles/modal";
import { SET_UPDATE } from "../../redux/actions";
import { ethers } from "ethers";
import socialContractAbi from "../../abi/Social.json";
import { socialAddress } from "../../contracts";

const TweetModal = (props) => {
  const [text, setText] = useState("");
  const [isTweetDisabled, setIsTweetDisabled] = useState(true);
  const [rulesID, setRulesID] = useState(0);
  const [preview, setPreview] = useState({ image: "", video: "", media: null });

  const user = useSelector((state) => state.profile.user);
  const theme = useSelector((state) => state.theme);
  const dispatch = useDispatch();

  const { handleClose, rows } = props;

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
    <React.Fragment>
      <Flex bg={theme.bg} color={theme.color}>
        <div>
          <img
            src={null}
            width="49px"
            height="49px"
            style={{ borderRadius: "50%" }}
          />
        </div>
        <div style={{ width: "100%" }}>
          <textarea
            rows={rows || 5}
            placeholder="What's happening?"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              e.target.value
                ? setIsTweetDisabled(false)
                : setIsTweetDisabled(true);
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
                onClick={async () => {
                  setIsTweetDisabled(true);
                  // preview.media preview.video preview.image
                  const social = new ethers.Contract(socialAddress, socialContractAbi, user.signer);
                  await social.post(text, rulesID);

                  setIsTweetDisabled(false);
                  setText("");
                  setPreview({ image: "", video: "", media: null });
                  toast("Your message was sent");
                  dispatch({ type: SET_UPDATE });
                  handleClose && handleClose();
                }}
                disabled={isTweetDisabled}
                defaultBg={theme.defaultBg}
                darkBg={theme.darkBg}
              >
                Post
              </Button>
            </div>
          </Flex>
        </div>
      </Flex>
    </React.Fragment>
  );
};

export default TweetModal;
