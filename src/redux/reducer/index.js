export default function user(
  state = {
    id: null,
    avatar: 'https:\\/\\/iili.io\\/FVdLas.png',
    name: 'Guest',
    email: 'email',
    email_verified_at: null,
    alamat: [],
    no_telpon: '',
    created_at: '2021-01-06T01:56:58.000000Z',
    updated_at: '2021-01-06T01:56:58.000000Z',
  },
  action,
) {
  switch (action.type) {
    case 'CHANGE/USER':
      return {...state, ...action.payload};
  }

  return state;
}
