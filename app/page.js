/*
  -Created by Fernando Valle 08/08/2023
  -Project Manager: Yuya Fujimoto
  -Open Avenues Micro-Internship: "Visualize Traffic Dataset with WebGL"
  
  This Program demonstrates the usage of Next.Js React framework, DeckGL and Mapbox to vizulaize data onto a map.
  Users are able to freely switch between both NYC data, LA data and DeckGL layers that corrhespond to the data such
  as Scatterplot, Hexagon and trips layer.
*/

'use client'

import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Map from 'react-map-gl';
import DeckGL from '@deck.gl/react';
import { ScatterplotLayer } from '@deck.gl/layers';
import { HexagonLayer } from '@deck.gl/aggregation-layers';
import { Select, Spin } from 'antd';
import { TripsLayer } from '@deck.gl/geo-layers';

//map token
const mapBoxToken = 'pk.eyJ1IjoiamFuZG85OSIsImEiOiJjbGpvcHA3ancxZWM5M3NsNW5qOWdhejE5In0.05RAcHQK3O3n-7lkRN1TXQ'

//Data function with embedded switch statement to choose and return either NYC or LA data
const getDataset = (dataset) => {
  switch (dataset) {
    case 'la':
      return {
        data: 'https://data.lacity.org/resource/6rrh-rzua.json?$limit=150000&$WHERE=within_box(location_1, 33.7035, -118.6682, 34.8233, -117.6464) AND location_1 IS NOT NULL',
        getPosition: d => [parseFloat(d.location_1.longitude), parseFloat(d.location_1.latitude)],
      };
    case 'nyc':
      return {
        data: 'https://data.cityofnewyork.us/resource/5rq2-4hqu.json?$limit=50000&boroname=Manhattan',
        getPosition: d => [parseFloat(d.longitude), parseFloat(d.latitude)],
      };
    default:
      throw new Error('Invalid dataset');
  }
};

//Scatterplot function
const scatterplotLayer = (city, finishLoading) => {
  const dataset = getDataset(city);

  return new ScatterplotLayer({
    id: 'scatterplot-layer',
    data: dataset.data,
    getPosition: dataset.getPosition,
    getRadius: d => Math.sqrt(d.exits),
    pickable: true,
    opacity: 0.8,
    stroked: true,
    filled: true,
    radiusScale: 6,
    radiusMinPixels: 1,
    radiusMaxPixels: 100,
    lineWidthMinPixels: 1,
    getFillColor: () => [255, 140, 0],
    getLineColor: () => [255, 0, 0],
    onDataLoad: finishLoading,
  });
};

//Hexagon fucntion
const hexagonLayer = (city, finishLoading) => {
  const dataset = getDataset(city);
  return new HexagonLayer({
    id: 'hexagon-layer',
    data: dataset.data,
    getPosition: dataset.getPosition,
    pickable: true,
    extruded: true,
    radius: 75,
    elevationScale: 10,
    opacity: 0.2,
    colorRange: [
      [255,255,178],
      [254,217,118],
      [254,178,76],
      [253,141,60],
      [240,59,32],
      [189, 0, 38],
    ],
    onDataLoad: () => {
      finishLoading();
    },
  });
};

//function viewstate to show NYC area once user clicks on option
const NYC_VIEW_STATE = {
  longitude: -74.0021069,
  latitude: 40.7423867,
  zoom: 12,
};

//function viewstate to show LA area once user clicks on option
const LA_VIEW_STATE = {
  longitude: -118.44886,
  latitude: 34.182652,
  zoom: 10,
};

//Main Function
export default function Home() {
  const [selectedDataset, setSelectedDataset] = useState('nyc');
  const [selectedLayer, setSelectedLayer] = useState('scatterplot');
  const [loading, setLoading] = useState(false);

  const [layers, setLayers] = useState([]);
  const [ref, setRef] = useState(null);

  const finishLoading = () => {
    setLoading(false);
  };

  //useeffect function to choose to view any of the 3 layers.
  useEffect(() => {
    switch (selectedLayer) {
      case 'scatterplot':
        if (ref) clearInterval(ref);
        setLayers([scatterplotLayer(selectedDataset, finishLoading)]);
        break;
      case 'hexagon':
        if (ref) clearInterval(ref);
        setLayers([hexagonLayer(selectedDataset, finishLoading)]);
        break;
      case 'trips':
        const timer = setInterval(() => {
          setLayers([
            new TripsLayer({
              id: 'trips',
              data: 'https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/trips/trips-v7.json',
              getPath: (d) => {
                return d.path;
              },
              getTimestamps: (d) => {
                return d.timestamps;
              },
              getColor: (d) => {
                return d.vendor === 0 ? [0, 255, 255] : [218, 112, 214];
              },
              opacity: 0.8,
              widthMinPixels: 4,
              rounded: true,
              trailLength: 180,
              currentTime: (performance.now() % 20000) / 10,
              shadowEnabled: false,
              onDataLoad: finishLoading,
            }),
          ]);
        }, 50);
        console.log({ timer });
        setRef(timer);
        break;
      default:
        throw new Error('Invalid layer');
    }
  }, [selectedLayer, selectedDataset]);

  const handleLayerChange = (value) => {
    setSelectedLayer(value);
  };

  const handleDatasetChange = (value) => {
    setLoading(true);
    setSelectedDataset(value);
  };

  const [showPopup, setShowPopup] = useState(false);

  //line 177 to 203 is a support popup menu if user is confused with program
  const handlePopupToggle = () => {
    setShowPopup(!showPopup);
  };

  const Popup = () => {
    return (
      <div
        style={{
          position: 'absolute',
          top: '60px',
          left: '20px',
          background: 'rgba(208, 211, 212, 0.5)',
          border: '5px solid #00ffff',
          padding: '8px',
          borderRadius: '4px',
          zIndex: 1,
        }}
      >
        <p style={{ color: 'rgb(249, 253, 0)' }}>
          Welcome to CitySync Support! <br />
          Please choose a layer and dataset from the dropdowns,<br />
          then it will direct you to Los Angeles Area or New York City to view layers and data!<br />
          Click <span style={{ color: '#00ffff' }}>Help?</span> to Close!
        </p>
      </div>
    );
  };

  //chooses either viewstate
  const viewState = selectedLayer === 'trips' || selectedDataset === 'nyc' ? NYC_VIEW_STATE : LA_VIEW_STATE;

  return ( //html5 with embedded css to show layers and data. Added Select and Spin from antd
    <main>
      <Head>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <DeckGL
        layers={layers}
        controller
        initialViewState={viewState}
        id="deckgl-overlay"
      >
        {showPopup && <Popup />}
        <div style={{ position: 'absolute', height: 60, width: '100%', backgroundColor: 'rgba(174, 182, 191, 0.2)', justifyContent: 'center', display: 'flex', flexDirection: 'row', alignItems: 'center', padding: 16, gap: 8 }}>
          <h2 style={{ color: 'rgb(249, 253, 0)', paddingRight: '8em' }}>CitySync: Choose your Layer and Data!</h2>
          <span style={{ color: 'rgb(249, 253, 0)' }}>Layer: </span>
          <Select
            value={selectedLayer}
            style={{ 
              padding: '8px', 
              border: 'none' }}
            onChange={handleLayerChange}
            options={[
              { value: 'scatterplot', label: 'Scatterplot', className : "custom-option" },
              { value: 'hexagon', label: 'Hexagon', className : "custom-option" },
              { value: 'trips', label: 'Trips', className : "custom-option" },
            ]}
          />
          <span style={{ color: 'rgb(249, 253, 0)' }}>Dataset: </span>
          {selectedLayer === 'trips' ? <div style={{ color: '#00ffff' }}>NYC</div> : (
            <Select
              value={selectedDataset}
              style={{  
                padding: '8px', 
                border: 'none' }}
              onChange={handleDatasetChange}
              options={[
                { value: 'la', label: 'LA Active Businesses', className:"custom-option" },
                { value: 'nyc', label: 'NYC Trees', className:"custom-option" },
              ]}
            />
          )}
          <br />
        <button style={{ color: '#00ffff' }} onClick={handlePopupToggle}>Help?</button>
        </div>
        <Map
          mapboxAccessToken={mapBoxToken}
          style={{ width: '100vw', height: '100vh' }}
          mapStyle="mapbox://styles/mapbox/dark-v9"
        />
      </DeckGL>
      {loading && <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'white', opacity: 0.6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin size="large" />
      </div>}
      <footer style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', textAlign: 'center', backgroundColor: 'rgba(174, 182, 191, 0.2)', color: 'rgb(249, 253, 0)', padding: '8px 0', }}>
        © {new Date().getFullYear()} Copyright by <a href="https://github.com/jando99/mapgl1.git"> Fernando Valle </a>
      </footer>
    </main>
  );
}
