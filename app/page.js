'use client'

import React from 'react';
import Map from 'react-map-gl';
import Head from 'next/head'
import Image from 'next/image'

import DeckGL from '@deck.gl/react/typed';
import {ScatterplotLayer} from '@deck.gl/layers/typed';
import {HexagonLayer} from '@deck.gl/aggregation-layers';


const mapBoxToken = 'pk.eyJ1IjoiamFuZG85OSIsImEiOiJjbGpvcHA3ancxZWM5M3NsNW5qOWdhejE5In0.05RAcHQK3O3n-7lkRN1TXQ'


const layer = new ScatterplotLayer({
  id: 'scatterplot-layer',
  data:  'https://data.cityofnewyork.us/resource/5rq2-4hqu.json?$limit=50000&boroname=Manhattan',
  getPosition: d => {
    console.log({d})
    return [ parseFloat(d.longitude), parseFloat(d.latitude)]},
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
  getLineColor: d => [255, 0, 0]
});

function getHexagonLayer() {
  const DATA_URI = 'https://data.lacity.org/resource/6rrh-rzua.json';
  const QS = `?$limit=150000&$WHERE=within_box(location_1, 33.7035, -118.6682, 34.8233, -117.6464) AND location_1 IS NOT NULL`;

  const HEXAGON_LAYER = new HexagonLayer({
      id: 'heatmap',
      data: DATA_URI + QS,
      colorDomain: [0,50],
      getPosition: d => [+d.location_1.longitude, +d.location_1.latitude],
      colorRange: [
        [0, 171, 152],   // Cold color (teal)
        [72, 189, 150],  // Cool color (green)
        [116, 255, 255], // Neutral color (light blue)
        [196, 255, 255], // Warm color (light pink)
        [255, 186, 122], // Warm color (peach)
        [255, 106, 106]  // Warm color (coral/red)
      ],         
      elevationRange: [0, 300],
      elevationScale: 250,
      extruded: true,
      radius: 100,        
      opacity: 0.2,        
      upperPercentile: 50,
      coverage: 0.8
    });
    return HEXAGON_LAYER;
}

export default function Home() {
  const HEXAGON_LAYER = getHexagonLayer();
  return (
    <main>
      <DeckGL
          layers={[layer,HEXAGON_LAYER]}
          controller
          initialViewState={{
            longitude: -74.0021069,
            latitude: 40.7423867,
            zoom: 12
          }}
          id="deckgl-overlay"
        >
          <Map
            mapboxAccessToken={mapBoxToken}
            style={{ width: '100vw', height: '100vh' }}
            mapStyle="mapbox://styles/mapbox/dark-v9"
          />
        </DeckGL>
    </main>
  )
}
