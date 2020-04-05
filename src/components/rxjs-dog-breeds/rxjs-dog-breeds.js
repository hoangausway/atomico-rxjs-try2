import { h, customElement } from 'atomico'
import StreamsEmitters from './streams-emitters'
import { useState$ } from './util-useState$'

/*
  StreamsEmitters is a pair of data streams and associated emitters.
  The component's state is managed by data streams.
*/
const RxJSDogBreeds = props => {
  const [{ breeds$ }, { keyupEmit, refreshEmit }] = StreamsEmitters
  const breeds = useState$(breeds$, { isError: false, data: [] })

  return (
    <host shadowDom>
      <style>{style(!breeds.isError)}</style>
      <header>
        <span>Search</span>
        <input
          id='input'
          placeholder='type in search term'
          onkeyup={keyupEmit}
        />
        <button onclick={refreshEmit}>Refresh</button>
      </header>
      <main>
        <div className='error'>Error: {breeds.data}</div>
        <ul>
          {/*
            bug: if set <li key={idx}>, will get crash in core.js after removing the li(s) and create them again
          */}
          {!breeds.isError && breeds.data.map((breed, idx) => <li>{breed}</li>)}
        </ul>
      </main>
    </host>
  )
}
RxJSDogBreeds.props = {}

export default customElement('rxjs-dog-breeds', RxJSDogBreeds)

// Helpers CSS
const style = isOk => `
:host {
  width: 100%;
}
header {
  padding: 6px;
}
header > input {
  margin-left: 10px;
  width: 200px;
  font-size: 0.75rem;
  padding: 3px;
}
header > button {
  margin-left: 10px;
}
.error {
  display: ${isOk ? 'none' : 'block'};
}
`
