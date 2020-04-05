/*
  - control emiting of typed characters in input element
  - fetch resource and gracefully process error
*/
import { of, combineLatest } from 'rxjs'
import {
  map,
  switchMap,
  catchError,
  startWith,
  debounceTime,
  distinctUntilChanged,
  flatMap
} from 'rxjs/operators'
import { fromFetch } from 'rxjs/fetch'
import { streaming } from './util-streaming'

// streams and triggers
const [keyup$, keyupEmit] = streaming()
const [refresh$, refreshEmit] = streaming()

// stream of typed chars
const chars$ = keyup$.pipe(
  map(e => e.target.value),
  debounceTime(300),
  distinctUntilChanged(),
  map(chars => chars.toLowerCase()),
  startWith('')
)

// helpers
const URL = 'https://dog.ceo/api/breeds/list/all'
const breedArray = jsonResponse => Object.keys(jsonResponse.message)

const json$ = of(URL).pipe(
  switchMap(url => fromFetch(url)),
  flatMap(res => res.json()),
  // network error, resource access error, json parsing error
  catchError(err => of({ isError: true, data: err.message }))
)

const response$ = refresh$.pipe(
  startWith('start'),
  // switchMap to keep main branch continuing even after error catched
  switchMap(() => json$),
  // main branch keeps going with data of error message or array of breeds
  map(json =>
    json.isError ? json : { isError: false, data: breedArray(json) }
  )
)

// filter: all breed names or only containing 'chars'
const f = chars => breed =>
  chars.length === 0 || breed.toLowerCase().includes(chars)

// resulting stream for use
const breeds$ = combineLatest(response$, chars$).pipe(
  map(([response, chars]) => {
    if (response.isError) return response
    return { isError: false, data: response.data.filter(f(chars)) }
  })
)

// export: [streams, emitters]
export default [{ breeds$ }, { keyupEmit, refreshEmit }]
