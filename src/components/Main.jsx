import { useMoralisQuery } from "react-moralis";
/* import Categories from "./Categories"
import Feed from "./Feed" */
import Polls from "./Polls";

const Main = () => {
  const queryCategories = useMoralisQuery("Categories");
  const fetchedCategories = JSON.parse(
    JSON.stringify(queryCategories.data, ["categoryId", "category"])
  );

  console.log(fetchedCategories);
  return (
    <div className="container">
      <div
        style={{
          display: "flex",
          fontFamily: "Roboto, sans-serif",
          color: "#041836",
          padding: "10px 30px",
          maxWidth: "1200px",
          width: "100%",
          gap: "20px",
        }}
      >
        {/* Inserted Poll 'component/Poll.js' */}
        <Polls />
        {/* Temporarily just commented-out */}
        {/* <Categories categories={fetchedCategories}/>
          <Feed/> */}
      </div>
    </div>
  );
};

export default Main;
