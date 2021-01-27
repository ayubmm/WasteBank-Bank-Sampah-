export default function user(state = {}, action) {
  switch (action.type) {
    case 'CHANGE/USER':
      return {...state, ...action.payload};
  }

  return state;
}
