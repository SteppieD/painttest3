// Test if server is working
fetch('http://localhost:3001')
  .then(res => {
    console.log('Status:', res.status);
    return res.text();
  })
  .then(text => {
    console.log('Response length:', text.length);
    if (text.includes('error') || text.includes('Error')) {
      console.log('Found error in response');
      const errorMatch = text.match(/<pre[^>]*>([\s\S]*?)<\/pre>/);
      if (errorMatch) {
        console.log('Error details:', errorMatch[1]);
      }
    } else {
      console.log('Server seems to be running OK');
    }
  })
  .catch(err => {
    console.error('Connection error:', err.message);
  });