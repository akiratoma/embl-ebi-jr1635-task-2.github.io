import { useCallback, useEffect, useMemo, useState } from "react";
import "./App.css";
import Logo from "./Logo";

function App() {
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [species, setSpecies] = useState([]);
  const [selectedSpecie, setSelectedSpecie] = useState(null);
  const [chromosomes, setChromosomes] = useState(null);
  const [tableState, setTableState] = useState("idle");
  const totalLength = useMemo(
    () => (chromosomes ?? []).reduce((acc, cur) => acc + cur.length, 0),
    [chromosomes]
  );

  const fetchSpecies = async () => {
    const response = await fetch("https://rest.ensembl.org/info/species?content-type=application/json");
    const json = await response.json();
    const species = json.species
      .filter((specie) => specie.groups.includes("variation"))
      .toSorted((a, b) => (a.display_name < b.display_name ? -1 : 1));

    setSpecies(species);
    setIsPageLoading(false);
  };

  const fetchChromosomes = async (name) => {
    const response = await fetch(
      `https://rest.ensembl.org/info/assembly/${name}?content-type=application/json`
    );
    const json = await response.json();
    const order = json.karyotype.reduce((acc, curr, idx) => acc.set(curr, idx), new Map());
    const chromosomes = json.top_level_region
      .filter((gene) => gene.coord_system === "chromosome")
      .toSorted((a, b) => order.get(a.name) - order.get(b.name));
    setChromosomes(chromosomes);
    setTableState("loaded");
  };

  const handleChange = (e) => {
    setTableState("loading");
    setSelectedSpecie(species[e.target.value]);
  };

  useEffect(() => {
    fetchSpecies();
  }, []);

  useEffect(() => {
    if (selectedSpecie) {
      fetchChromosomes(selectedSpecie.name);
    }
  }, [selectedSpecie]);

  const formatLength = useCallback((len) => {
    if (len < 1_000) {
      return `${len} bytes`;
    } else if (len < 1_000_000) {
      return `${(len / 1000).toFixed(2)} Kb`;
    } else if (len < 1_000_000_000) {
      return `${(len / 1000 ** 2).toFixed(2)} Mb`;
    } else if (len < 1_000_000_000_000) {
      return `${(len / 1000 ** 3).toFixed(2)} Gb`;
    } else {
      return `${len} bytes`;
    }
  }, []);

  return (
    <div className="outer">
      <div className="inner">
        {isPageLoading ? (
          <div className="logoContainer">
            <div className="logo">
              <Logo />
            </div>
          </div>
        ) : (
          <div>
            <h1>Species Assembly Summaries</h1>
            <div>
              <div className="selectContainer">
                <h4>Species</h4>
                <select className="selectBox" onChange={handleChange} defaultValue={""}>
                  <option disabled value={""}>
                    Select an option
                  </option>
                  {species.map((specie, idx) => (
                    <option key={specie.name} value={idx}>
                      {specie.display_name}
                    </option>
                  ))}
                </select>
              </div>
              {selectedSpecie ? <h2>{selectedSpecie.display_name}</h2> : null}
              {tableState === "idle" ? null : tableState === "loading" ? (
                <div className="tableLogoContainer">
                  <div className="logoContainer">
                    <div className="logo">
                      <Logo />
                    </div>
                  </div>
                </div>
              ) : tableState === "loaded" ? (
                <div>
                  <h4>Total Length: {totalLength} bp</h4>
                  <table>
                    <tbody>
                      {chromosomes.map((chromosome) => (
                        <tr key={chromosome.name}>
                          <td>
                            {chromosome.name}: {formatLength(chromosome.length)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
