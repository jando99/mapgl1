'use client'

import React from 'react';
import Map from 'react-map-gl';
import Head from 'next/head'
import Image from 'next/image'

import DeckGL from '@deck.gl/react/typed';
import {ScatterplotLayer} from '@deck.gl/layers/typed';


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

export default function Home() {
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
          <Map
            mapboxAccessToken={mapBoxToken}
            style={{ width: '100vw', height: '100vh' }}
            mapStyle="mapbox://styles/mapbox/dark-v9"
          />
        </DeckGL>
    </main>
  )
}
