import { Route, Routes} from "react-router-dom" ;
import './App.css'
import HomePage from './components/HomePage.jsx';
import QuestionPage from './components/QuestionPage.jsx';

import GetUsername from './components/EnterUsername.jsx';
import RulesPage from './components/RulesPage.jsx';
import Leaderboard from './components/Leaderboard.jsx';
import Share from './components/Share.jsx';
import LoginForm from './components/LoginForm.jsx';
import AdminScreen from './components/AdminScreen.jsx';
import CreateQuestion from "./components/CreateQuestion.jsx";

export default function App () {
  return (
    <div className="app">
    <Routes>
        <Route path="/questions" element={<QuestionPage />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/getname" element={<GetUsername />} />
        <Route path="/rules" element={<RulesPage />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/share" element={<Share />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/admin" element={<AdminScreen />} />
        <Route path="/add-question" element={<CreateQuestion />} />
    </Routes>
    </div>
  )
}
