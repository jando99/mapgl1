'use client'

import React, { useState, ChangeEvent } from 'react';
import Map from 'react-map-gl';
import Head from 'next/head'
import Image from 'next/image'

import DeckGL from '@deck.gl/react/typed';
import {ScatterplotLayer} from '@deck.gl/layers/typed';
import {HexagonLayer} from '@deck.gl/aggregation-layers';


const mapBoxToken = 'pk.eyJ1IjoiamFuZG85OSIsImEiOiJjbGpvcHA3ancxZWM5M3NsNW5qOWdhejE5In0.05RAcHQK3O3n-7lkRN1TXQ'

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
      throw new Error('Invalid dataset!');
  }
};


const scatterplotLayer = (city) => {
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
    getFillColor: d => [255, 140, 0],
    getLineColor: d => [255, 0, 0],
  });
};

const hexagonLayer = (city) => {
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
  });
};

export default function Home() {
  const [selectedDataset, setSelectedDataset] = useState('nyc');
  const [selectedLayer, setSelectedLayer] = useState('scatterplot');

  const layer = selectedLayer === 'scatterplot' ? scatterplotLayer(selectedDataset) : hexagonLayer(selectedDataset);

  const handleLayerChange = (x) => {
    const newSelectedLayer = x.target.value;
    setSelectedLayer(newSelectedLayer);
  };

  const handleDatasetChange = (x) => {
    const newSelectedDataset = x.target.value;
    setSelectedDataset(newSelectedDataset);
  };
  
  return (
    <main>
      <DeckGL
          layers={[layer]}
          controller
          initialViewState={{
            longitude: -74.0021069,
            latitude: 40.7423867,
            zoom: 12
          }}
          id="deckgl-overlay"
        >
          <div style={{ position: 'absolute', height: 60, width: '100%', backgroundColor: 'rgba(174, 182, 191, 0.2)', justifyContent: 'center',display: 'flex', flexDirection: 'row', alignItems: 'center', padding: 16, gap: 8 }}>
            <h2 style={{color:'#ff8c00'}}>Choose your Layer and Data!</h2> <br/>
            <select onChange={handleLayerChange} value={selectedLayer} style={{ backgroundColor: 'rgba(174, 182, 191, 0.2)', color: '#ff8c00', padding: '8px', border: 'none' }}>
              <option value="scatterplot">Scatterplot Layer</option>
              <option value="hexagon" >Hexagon Layer</option>
            </select>
            <select onChange={handleDatasetChange} value={selectedDataset} style={{ backgroundColor: 'rgba(174, 182, 191, 0.2)', color: '#ff8c00', padding: '8px', border: 'none' }}>
              <option value="la">LA Active Businesses</option>
              <option value="nyc">NYC Trees</option>
            </select>
          </div>
          <Map
            mapboxAccessToken={mapBoxToken}
            style={{ width: '100vw', height: '100vh' }}
            mapStyle="mapbox://styles/mapbox/dark-v9"
          />
        </DeckGL>
    </main>
  )
}
