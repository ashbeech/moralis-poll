import React, { useState, useEffect } from "react";
import {
  useMoralis,
  useNativeBalance,
  useNewMoralisObject,
} from "react-moralis";
import Poll from "react-polls";

// Declaring poll question and answers
const pollQuestion = "Youtube is the best place to learn ?";
const answers = [
  { option: "Yes", votes: 7 },
  { option: "No", votes: 2 },
  { option: "don't know", votes: 1 },
];
let option_voted = "";
let poll_id = null;
let voter = {};
let poll_title = "";
let poll_options = [];

function Polls({ more }) {
  //
  const [access, setReg] = useState(false);
  const { refetchUserData, account, isAuthenticated, Moralis } = useMoralis();
  //const { switchNetwork, chainId, chain, account } = useChain();
  const {
    getBalance,
    data: balance,
    nativeToken,
    isLoading,
  } = useNativeBalance({ chain: "mumbai" });
  const { isSaving, error, save, object } = useNewMoralisObject("Polls");

  // Setting answers to state to reload the component with each vote
  const [pollAnswers, setPollAnswers] = useState([...answers]);

  // TODO: Need to display/build Polls data from Moralis instance.
  // 'AvZstBTkxkj7nI517qNWXPym' is static, exisiting example of objectId in db.
  // 👇
  /*   
    const PollsData = Moralis.Object.extend("Polls");
    const query = new Moralis.Query(PollsData);

    query.get("AvZstBTkxkj7nI517qNWXPym").then(
    (object) => {
      // The object was retrieved successfully.
      console.log("Account: ", JSON.stringify("Poll Data:", object));
    },
    (error) => {
      // The object was not retrieved successfully.
      // error is a Moralis.Error with an error code and message.
    }
  ); */

  const checkReg = async (_access) => {
    console.log("Account: ", JSON.stringify(account));

    if (!isAuthenticated) {
      return false;
    } else {
      // reset options
      option_voted = "";
      poll_id = "AvZstBTkxkj7nI517qNWXPym"; //<-- temp objectId to update same row, instead of saving new row
      voter = account; //user.attributes.accounts[0];
      poll_title = pollQuestion;
      poll_options = [];

      console.log("Token Balances: ", JSON.stringify(balance.balance));

      // give access to vote if meets conditions
      _access = balance.balance && voter ? true : false;
      setReg(_access);
      return _access;
    }
  };

  useEffect(() => {
    checkReg();
  }, [account, balance]);

  const handleVote = async (voteAnswer) => {
    option_voted = voteAnswer;

    const asyncVoteRes = await Promise.all(
      pollAnswers.map(async (answer) => {
        if (answer.option === option_voted) {
          answer.votes = answer.votes + 1;
        }
        return answer;
      })
    );

    console.log("Async", asyncVoteRes);
    poll_options = asyncVoteRes;

    // Poll Class
    // columns: poll_id: uint, poll_options: [{option: "Yes", votes: 7}, {option: "No", votes: 2}], poll_voters: {user_id}

    // test db integration with static example
    // create poll
    //
    let poll_data = {
      id: poll_id,
      options: poll_options,
      voted: voter,
    };

    const pollObject = new Moralis.Object("Polls");
    pollObject.set("objectId", poll_data.id);
    pollObject.set("options", poll_data.options);
    pollObject.addUnique("voted", poll_data.voted);
    pollObject.save();
  };

  if (!access) {
    return <>{"NO ACCESS"}</>;
  }

  return (
    <>
      <Poll
        question={pollQuestion}
        answers={pollAnswers}
        onVote={handleVote}
        noStorage
      />
    </>
  );
}

export default Polls;
