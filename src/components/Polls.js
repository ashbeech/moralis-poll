import React, { useState, useEffect, useRef } from "react";
import {
  useMoralis,
  useNativeBalance,
  useNewMoralisObject,
} from "react-moralis";
import Poll from "react-polls";

let saved_account = "";

// WARNING: DEMO CODE/WIP
// TODO: Need to display/build Polls data from Moralis instance.
// TODO: utilise further  calls such as …
// 'const { switchNetwork, chainId, chain, account } = useChain();'

// Declaring poll question and answers
// Currenltly static, exisiting example of objectId in Moralis instance's db.

const pollQuestion = "Youtube is the best place to learn ?";
const answers = [
  { option: "Yes", votes: 7 },
  { option: "No", votes: 2 },
  { option: "don't know", votes: 1 },
];
let option_voted = "";
let poll_id = 1;
let voter = {};
let poll_title = "";
let poll_options = [];

function Polls({ more }) {
  const [access, setReg] = useState(false);
  const { isInitialized, account, isAuthenticated, Moralis } = useMoralis();

  const {
    getBalance,
    data: balance,
    nativeToken,
    isLoading,
  } = useNativeBalance({ chain: "mumbai" });
  const { isSaving, error, save, object } = useNewMoralisObject("Polls");

  // Setting answers to state to reload the component with each vote
  const [pollAnswers, setPollAnswers] = useState([...answers]);
  const isInitialMount = useRef(true);

  const updatePoll = async () => {
    const PollData = Moralis.Object.extend("Polls");
    const query = new Moralis.Query(PollData);
    // Building Poll from Moralis instance will include: 'query.equalTo("id", 1);'
    query.equalTo("pollId", 1); //<-- temp/static id to update same row, instead of saving new row
    const poll = await query.first();

    return poll;
  };

  // check reg status -> handle
  const checkReg = async (_access) => {
    if (!isAuthenticated) {
      // not authenticated user
      return false;
    } else {
      // access condition
      _access = balance.balance && balance.balance > 0 ? true : false;
      if (_access) {
        // reset/build options
        option_voted = "";
        voter = account;
        poll_title = pollQuestion;
        poll_options = answers;
        setPollAnswers(poll_options);
        // give access to vote if meets conditions
        setReg(_access);
        saved_account = account;
      } else {
        // no access
      }

      return _access;
    }
  };

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else {
      // run on update
      if (isInitialized && balance.balance > 0) {
        if (saved_account !== account) {
          // check registration status
          checkReg();
        }
      } else {
        // reset registration status to false
        setReg(false);
      }
    }
  }, [account, balance, isInitialized]);

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

    // Poll Class Design
    // columns: poll_id: uint, poll_options: [{option: "Yes", votes: 7}, {option: "No", votes: 2}], poll_voters: {user_id}

    // test db integration with static example
    // create poll
    //
    let poll_data = {
      id: poll_id,
      title: poll_title,
      options: poll_options,
      voted: voter,
    };

    const pollObject = new Moralis.Object("Polls");
    pollObject.set("id", poll_data.id);
    pollObject.set("title", poll_data.title);
    pollObject.set("options", poll_data.options);
    pollObject.addUnique("voted", poll_data.voted);
    pollObject.save();
  };

  // Not authoriased
  if (!access) {
    return <>{"NO ACCESS"}</>;
  }

  // Authoriased
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
