import { Route, Routes} from "react-router-dom" ;
import './App.css'
import HomePage from './components/HomePage.jsx';


export default function App () {
  return (
    <div className="app">
    <Routes>
        <Route path="/" element={<HomePage />} />
    </Routes>
    </div>
  )
}
