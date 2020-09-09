// ref to leaderboard collection in db
// used to contain team documents
const teams = db.collection("leaderboard");


// -- ADDING TEAMS --

// fires callback function when new team form submit button is clicked
const addForm = document.querySelector('.form-inline');
if(addForm != null){
    addForm.addEventListener('submit', e => {
        e.preventDefault();

        addTeam(addForm.name.value, addForm.logo.value);

        // reset input values
        addForm.name.value = '';
        addForm.logo.value = '';
    });
}

// adds a new team document to the collection
const addTeam = function (teamName, logoPath) {
    teams.get()
        .then(querySnapshot => {
            // how many documents are in the db (+1 to account for new one)
            var numTeams = querySnapshot.size + 1;

            // create new document w/ teamName as id
            teams.doc(teamName).set({
                name: teamName,
                logo: logoPath,
                rank: numTeams,
                pointsFor: 0,
                pointsAgainst: 0,
                wins: 0,
                losses: 0,
                trend: true,
                recentUpdate: name
            });
        });
};


// -- UPDATING SCORES & WINS/LOSSES --

// adds to the pointsFor and pointsAgainst fields
// determines whether to add a win or a loss
const addPoints = function(teamName, newPointsFor, newPointsAgainst) {
    // variables for whether the team lost or won
    // both added to the current amount of wins and losses
    var newWin = 0;
    var newLoss = 0;
    
    // if more points were scored than the opposing team, newWin set to 1
    // else, newLoss sets to 1
    if(parseInt(newPointsFor) > parseInt(newPointsAgainst)){ newWin = 1; }
    else{ newLoss = 1; }
    
    var docRef = teams.doc(teamName);

    // updating the document
    docRef.get()
        .then(doc => {
            if(doc.exists){
                docRef.update({
                    pointsFor: parseInt(doc.data().pointsFor) + parseInt(newPointsFor),
                    pointsAgainst: parseInt(doc.data().pointsAgainst) + parseInt(newPointsAgainst),
                    wins: parseInt(doc.data().wins) + newWin,
                    losses: parseInt(doc.data().losses) + newLoss,
                    recentUpdate: 'points'
                })
            }
            else{ console.log("could not find that document"); }
        });
}



// real-time listener
// callback fires for every change made to documents
teams.orderBy('rank', 'asc').onSnapshot(snapshot => {
    // a list of EVERY recent change made to the collection
    var changes = snapshot.docChanges();

    changes.forEach(change => {

        // changing display

        if(change.type === 'added'){
            // all the data from the changed document
            const numTeam = change.doc.data().numTeam;
            const logoPath = change.doc.data().logo;
            const name = change.doc.data().name;
            const pointsFor = change.doc.data().pointsFor;
            const pointsAgainst = change.doc.data().pointsAgainst;
            const wins = change.doc.data().wins;
            const losses = change.doc.data().losses;

            
            var table = document.querySelector('tbody');
            var tr = table.insertRow();

            // admin page gets extra column for add points form
            var cols = 6;
            if(admin){
                cols += 2;
            }

            // adding in new row elements
            for(var i = 0; i < cols; i++){
                var td = document.createElement('td');
                td = tr.insertCell(i);

                if(i == 0){
                    // TRYING AGAIN: Rank column

                    var p = document.createElement('p');
                    p.textContent = rank;
                    p.setAttribute('class', 'row-rank');
                    td.appendChild(p);
                }
                else if(i == 1){
                    // display locally stored logo
                    // path to logo stored in firestore
                    var img = document.createElement('img');
                    img.setAttribute('src', logoPath);
                    img.setAttribute('class', 'team-logo');

                    td.appendChild(img);
                }
                else if(i == 2){
                    var p = document.createElement('p');
                    p.textContent = name;
                    p.setAttribute('class', 'pt-3-half');

                    td.appendChild(p);
                }
                else if(i == 3){
                    var p = document.createElement('p');
                    p.textContent = wins + ' - ' + losses;
                    p.setAttribute('class', 'pt-3-half');

                    td.appendChild(p);
                }
                else if(i == 4){
                    var p = document.createElement('p');
                    p.textContent = pointsFor;
                    p.setAttribute('class', 'pt-3-half');

                    td.appendChild(p);
                }
                else if(i == 5){
                    var p = document.createElement('p');
                    p.textContent = pointsAgainst;
                    p.setAttribute('class', 'pt-3-half');

                    td.appendChild(p);
                }
                else if(i == 6){
                    // Add Points Form

                    var form = document.createElement('form');

                    var pointsForInput = document.createElement('input');
                    pointsForInput.type = 'text';
                    pointsForInput.name = 'pointsFor';

                    var pointsAgainstInput = document.createElement('input');
                    pointsAgainstInput.type = 'text';
                    pointsAgainstInput.name = 'pointsAgainst';

                    form.appendChild(pointsForInput);
                    form.appendChild(pointsAgainstInput);

                    var button = document.createElement('button');
                    button.type = 'submit';
                    button.innerHTML = 'Add Points';
                    button.setAttribute('class', 'submit');

                    form.appendChild(button);

                    form.setAttribute('class', 'pointsForm');
                    form.setAttribute('id', name);

                    form.addEventListener('submit', e => {
                        e.preventDefault();
                
                        addPoints(name, form.pointsFor.value, form.pointsAgainst.value);
                
                        form.pointsFor.value = '';
                        form.pointsAgainst.value = '';
                    });

                    form.setAttribute('class', 'pt-3-half');

                    td.appendChild(form);
                }
                else if(i == 7){
                    // Set Score
                    var statForm = document.createElement('form');

                    var winsInput = document.createElement('input');
                    winsInput.setAttribute('placeholder', 'wins');
                    winsInput.type = 'text';
                    winsInput.name = 'wins';

                    var lossesInput = document.createElement('input');
                    lossesInput.setAttribute('placeholder', 'losses');
                    lossesInput.type = 'text';
                    lossesInput.name = 'losses';

                    var pointsForInput = document.createElement('input');
                    pointsForInput.setAttribute('placeholder', 'points for');
                    pointsForInput.type = 'text';
                    pointsForInput.name = 'pointsFor';

                    var pointsAgainstInput = document.createElement('input');
                    pointsAgainstInput.setAttribute('placeholder', 'points against');
                    pointsAgainstInput.type = 'text';
                    pointsAgainstInput.name = 'pointsAgainst';

                    statForm.appendChild(winsInput);
                    statForm.appendChild(lossesInput);
                    statForm.appendChild(pointsForInput);
                    statForm.appendChild(pointsAgainstInput);

                    var button = document.createElement('button');
                    button.type = 'submit';
                    button.innerHTML = 'Set Stats';
                    button.setAttribute('class', 'submit');

                    statForm.appendChild(button);

                    statForm.setAttribute('class', 'statsForm');
                    statForm.setAttribute('id', doc.data().name);

                    statForm.addEventListener('submit', e => {
                        e.preventDefault();
                
                        var newStats = {};

                        if(statForm.wins.value !== ''){
                            newStats.wins = parseInt(statForm.wins.value);
                        }

                        if(statForm.losses.value !== ''){
                            newStats.losses = parseInt(statForm.losses.value);
                        }

                        if(statForm.pointsFor.value !== ''){
                            newStats.pointsFor = parseInt(statForm.pointsFor.value);
                        }
                        
                        if(statForm.pointsAgainst.value !== ''){
                            newStats.pointsAgainst = parseInt(statForm.pointsAgainst.value);
                        }

                        setStats(doc.data().name, newStats);

                        statForm.losses.value = '';
                        statForm.wins.value = '';
                        statForm.pointsFor.value = '';
                        statForm.pointsAgainst.value = '';
                    });

                    statForm.setAttribute('class', 'pt-3-half');

                    td.appendChild(statForm);
                }
                
            }
        }
        // else if(change.type === 'removed'){
        //     teams.where('rank', '>', change.doc.data().rank)
        //         .orderBy('rank', 'asc').get()
        //         .then(lowerRanks => {
        //             lowerRanks.forEach(lr => {
        //                 var lowRef = teams.doc(lr.data().name);

        //                 lowRef.update({
        //                     rank: lr.data().rank - 1,
        //                     recentUpdate: 'rank'
        //                 })
        //                     //.then(() => location.reload())
        //             })
        //         })
        // }
        // Points / record change
        else if(change.doc.data().recentUpdate === 'points'){

            const name = change.doc.data().name;
            var currRank = change.doc.data().rank;
            const pointsFor = change.doc.data().pointsFor;
            const pointsAgainst = change.doc.data().pointsAgainst;
            const wins = change.doc.data().wins;
            const losses = change.doc.data().losses;

            console.log('points/record change hit for: ', name);

            // looks at teams ranked HIGHER than the one whose score changed
            teams.where('rank', '<', currRank)
                .orderBy('rank', 'desc').get()
                    .then(upperRanks => {
                        upperRanks.forEach(ur => {
                            // swap based on wins
                            if(ur.data().wins < wins) {

                                var temp = currRank;
                                currRank = ur.data().rank;

                                var upRef = teams.doc(ur.data().name);

                                teams.doc(name).update({
                                    rank: currRank,
                                    recentUpdate: 'rank'
                                })
                                    .then(() => {
                                        upRef.update({
                                            rank: temp,
                                            recentUpdate: 'rank'
                                        })
                                        .then(() => {
                                            //location.reload();
                                        });
                                    });
                            }
                            // swap based on losses
                            else if(ur.data().wins === wins 
                                && ur.data().losses > losses){

                                    var temp = currRank;
                                    currRank = ur.data().rank;
                                
                                    var upRef = teams.doc(ur.data().name);

                                    teams.doc(name).update({
                                        rank: currRank,
                                        recentUpdate: 'rank'
                                    })
                                        .then(() => {

                                            upRef.update({
                                                rank: temp,
                                                recentUpdate: 'rank'
                                            })
                                            .then(() => {
                                                //location.reload();
                                            });
                                        });
                            }
                            // swap based on points for
                            else if(ur.data().wins === wins && ur.data().losses === losses
                                && ur.data().pointsFor < pointsFor){

                                    var temp = currRank;
                                    currRank = ur.data().rank;

                                    var upRef = teams.doc(ur.data().name);

                                    teams.doc(name).update({
                                        rank: currRank,
                                        recentUpdate: 'rank'
                                    })
                                        .then(() => {

                                            upRef.update({
                                                rank: temp,
                                                recentUpdate: 'rank'
                                            })
                                            .then(() => {
                                                //location.reload();
                                            });
                                        });
                            }
                            // swap based on points against
                            else if(ur.data().wins === wins && ur.data().losses === losses
                                && ur.data().pointsFor === pointsFor && ur.data().pointsAgainst > pointsAgainst){

                                    var temp = currRank;
                                    currRank = ur.data().rank;

                                    var upRef = teams.doc(ur.data().name);

                                    teams.doc(name).update({
                                        rank: currRank,
                                        recentUpdate: 'rank'
                                    })
                                        .then(() => {

                                            upRef.update({
                                                rank: temp,
                                                recentUpdate: 'rank'
                                            })
                                            .then(() => {
                                                //location.reload();
                                            });
                                        });
                            }
                        })
                    });
        }
        
    });
});
