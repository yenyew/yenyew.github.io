import { Route, Routes} from "react-router-dom" ;
import './App.css'
import HomePage from './components/HomePage.jsx';
import GetUsername from './components/EnterUsername.jsx';
import RulesPage from './components/RulesPage.jsx';
import Leaderboard from './components/Leaderboard.jsx';
import Share from './components/Share.jsx';
import LoginScreen from './components/Login.jsx';


export default function App () {
  return (
    <div className="app">
    <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/getname" element={<GetUsername />} />
        <Route path="/rules" element={<RulesPage />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/share" element={<Share />} />
        <Route path="/login" element={<LoginScreen />} />
    </Routes>
    </div>
  )
}
