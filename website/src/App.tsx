import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import Home from '@/pages/Home';
import About from '@/pages/About';
import Projects from '@/pages/Projects';
import Knowledge from '@/pages/Knowledge';
import TerminalTiler from '@/pages/TerminalTiler';
import Skills from '@/pages/Skills';
import MixedPreviewApp from '@/apps/mixed-preview/App';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/knowledge" element={<Knowledge />} />
          <Route path="/about" element={<About />} />
          <Route path="/terminal-tiler" element={<TerminalTiler />} />
          <Route path="/skills" element={<Skills />} />
          <Route path="/mixed-preview" element={<MixedPreviewApp />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
