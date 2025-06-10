import { Route, Routes} from "react-router-dom" ;
import './App.css'
import HomePage from './components/HomePage.jsx';
import QuestionPage from './components/QuestionPage.jsx';


export default function App () {
  return (
    <div className="app">
    <Routes>
        <Route path="/" element={<QuestionPage />} />
    </Routes>
    </div>
  )
}
