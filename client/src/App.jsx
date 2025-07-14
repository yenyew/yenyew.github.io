import { Route, Routes } from "react-router-dom";
import './App.css'

import HomePage from './components/HomePage.jsx';
import QuestionPage from './components/QuestionPage.jsx';
import GetUsername from './components/EnterUsername.jsx';
import GetCode from './components/EnterCollectionCode.jsx';
import RulesPage from './components/RulesPage.jsx';
import Leaderboard from './components/Leaderboard.jsx';
import Share from './components/Share.jsx';
import LoginForm from './components/LoginForm.jsx';
import AdminScreen from './components/AdminScreen.jsx';
import CreateQuestion from "./components/CreateQuestion.jsx";
import EditQuestion from "./components/EditQns.jsx";
import Questions from "./components/Questions.jsx";
import CreateCollection from "./components/CreateCollection.jsx";
import EditCollection from "./components/EditCollection.jsx";

export default function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/game" element={<QuestionPage />} />
        <Route path="/getname" element={<GetUsername />} />
        <Route path="/getcode" element={<GetCode />} />
        <Route path="/rules" element={<RulesPage />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/share" element={<Share />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/admin" element={<AdminScreen />} />
        <Route path="/add-question" element={<CreateQuestion />} />
        <Route path="/questions" element={<Questions />} />
        <Route path="/edit-question/:number/:collectionId" element={<EditQuestion />} />
        <Route path="/add-collection" element={<CreateCollection />} />
        <Route path="/edit-collection/:id" element={<EditCollection />} />
      </Routes>
    </div>
  );
}
