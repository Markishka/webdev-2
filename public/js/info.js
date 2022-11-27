const users = [];

function clientJoin(id, username, room){
    const client = {id, username, room};
    users.push(client);
    return client;
}

function getUser(id){
    return client.find(client => client.id === id);
}

module.exports = {
    clientJoin,
    getUser
};