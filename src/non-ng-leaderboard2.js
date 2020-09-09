const teams = db.collection("TestTeams");

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

const addElement = function (type, parent, extras = {}) {
    var elem = document.createElement(type);
    
    if(text = extras.text){ 
        // making sure element can have a text field
        try{
            elem.textContent = text;
        }
        catch(err){
            console.log(`a ${type} element cannot have a text field`);
        }
    }

    if(class_name = extras.class){
        elem.setAttribute('class', class_name);
    }

    if(img_src = extras.src){
        elem.setAttribute('src', img_src);
    }

    if(id = extras.id){
        elem.setAttribute('id', id);
    }

    parent.appendChild(elem);
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

const setStats = function(teamName, newStats){
    var docRef = teams.doc(teamName);

    docRef.get()
        .then(doc => {
            if(doc.exists){
                docRef.update(newStats)
                    .then(() => setTimeout(function(){ location.reload() }, 500))
            }
            else{ console.log("could not find that document"); }
        });
}

// adds to the pointsFor and pointsAgainst fields
// determines whether to add a win or a loss
const addPoints = async function(teamName, newPointsFor, newPointsAgainst) {
    // variables for whether the team lost or won
    // both added to the current amount of wins and losses
    var newWin = 0;
    var newLoss = 0;
    
    // if more points were scored than the opposing team, newWin set to 1
    // else, newLoss sets to 1
    if(newPointsFor > newPointsAgainst){ newWin = 1; }
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

const swapRanks = function(ref, other_ref){
    ref.get()
        .then(doc => {
            const temp_rank = doc.data().rank;

            other_ref.get()
                .then(other_doc => {
                    const other_rank = other_doc.data().rank;

                    other_ref.update({
                        rank: temp_rank,
                        recentupdate: 'rank'
                    })
                        .then(() => {
                            ref.update({
                                rank: other_rank,
                                recentUpdate: 'rank'
                            });
                        })
                });
        })  
}

const checkRanks = function(teamName){
    var docRef = teams.doc(teamName);
    docRef.get()
        .then((doc) => {
            teams.where('rank', '<', doc.data().rank)
                .orderBy('rank', 'desc').get()
                    .then(upperRanks => {
                        var numSwaps = 0;
                        upperRanks.forEach(ur => {
                            if(ur.data().wins < doc.data().wins){
                                var upRef = teams.doc(ur.data().name);
                                setTimeout(function(){swapRanks(docRef, upRef)}, 1000 * numSwaps);
                                numSwaps++;
                            }
                            else if(ur.data().wins === doc.data().wins){
                                if(ur.data().losses > doc.data().losses){
                                    var upRef = teams.doc(ur.data().name);
                                    setTimeout(function(){swapRanks(docRef, upRef)}, 1000 * numSwaps);
                                    numSwaps++;
                                }
                                else if(ur.data().losses === doc.data().losses){
                                    if(ur.data().pointsFor < doc.data().pointsFor){
                                        var upRef = teams.doc(ur.data().name);
                                        setTimeout(function(){swapRanks(docRef, upRef)}, 1000 * numSwaps);
                                        numSwaps++;
                                    }
                                    else if(ur.data().pointsFor === doc.data().pointsFor){
                                        if(ur.data().pointsAgainst > doc.data().pointsAgainst){
                                            var upRef = teams.doc(ur.data().name);
                                            setTimeout(function(){swapRanks(docRef, upRef)}, 1000 * numSwaps);
                                            numSwaps++;
                                        }
                                    }
                                }
                            }
                        });
                        
                        if(admin){
                            var pointsFormBtn = document.querySelector('#' + doc.data().name + '-points button');
                            pointsFormBtn.innerHTML = 'Adjusting ranks... This may take a few seconds';
                        }
                        
                        setTimeout(function(){ 
                            location.reload();
                            if(admin){ pointsFormBtn.innerHTML = 'add points'; }
                        }, 1300 * numSwaps);
                    });
            })
}

// realtime listener
teams.orderBy('rank', 'asc').onSnapshot(snapshot => {
    var changes = snapshot.docChanges();

    changes.forEach(async change => {
        if(change.type === 'added'){
            var table = document.querySelector('tbody');
            var tr = table.insertRow();

            // admin page gets extra column for add points form
            var cols = 6;
            if(admin){
                cols += 2;
            }

            var doc = change.doc;

            // adding in new row elements
            for(var i = 0; i < cols; i++){ 
                var td = document.createElement('td');
                td = tr.insertCell(i);

                if(i == 0){
                    addElement('p', td, 
                        {
                            text: doc.data().rank, 
                            class: 'row-rank'
                        });
                }
                else if(i == 1){
                    addElement('img', td,
                    {
                        src: doc.data().logo,
                        class: 'team-logo'
                    });
                }
                else if(i == 2){
                    addElement('p', td, {
                        text: doc.data().name,
                        class: 'pt-3-half'
                    });
                }
                else if(i == 3){
                    addElement('p', td, {
                        text: doc.data().wins + ' - ' + doc.data().losses,
                        class: 'pt-3-half'
                    });
                }
                else if(i == 4){
                    addElement('p', td, {
                        text: doc.data().pointsFor,
                        class: 'pt-3-half'
                    });
                }
                else if(i == 5){
                    addElement('p', td, {
                        text: doc.data().pointsAgainst,
                        class: 'pt-3-half'
                    });
                }
                else if(i == 6){
                    // Add Points Form

                    var form = document.createElement('form');

                    var pointsForInput = document.createElement('input');
                    pointsForInput.setAttribute('placeholder', 'points for');
                    pointsForInput.type = 'text';
                    pointsForInput.name = 'pointsFor';

                    var pointsAgainstInput = document.createElement('input');
                    pointsAgainstInput.setAttribute('placeholder', 'points against');
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
                    form.setAttribute('id', doc.data().name + '-points');

                    form.addEventListener('submit', e => {
                        e.preventDefault();
                
                        addPoints(doc.data().name, parseInt(form.pointsFor.value), parseInt(form.pointsAgainst.value));
                
                        form.pointsFor.value = '';
                        form.pointsAgainst.value = '';
                    });

                    form.setAttribute('class', 'pt-3-half');

                    td.appendChild(form);
                }
                else if(i == 7){
                    // Set Score
                    var statForm = document.createElement('form');

                    var winsStatInput = document.createElement('input');
                    winsStatInput.setAttribute('placeholder', 'wins');
                    winsStatInput.type = 'text';
                    winsStatInput.name = 'winsStat';

                    var lossesStatInput = document.createElement('input');
                    lossesStatInput.setAttribute('placeholder', 'losses');
                    lossesStatInput.type = 'text';
                    lossesStatInput.name = 'lossesStat';

                    var pointsForStatInput = document.createElement('input');
                    pointsForStatInput.setAttribute('placeholder', 'points for');
                    pointsForStatInput.type = 'text';
                    pointsForStatInput.name = 'pointsForStat';

                    var pointsAgainstStatInput = document.createElement('input');
                    pointsAgainstStatInput.setAttribute('placeholder', 'points against');
                    pointsAgainstStatInput.type = 'text';
                    pointsAgainstStatInput.name = 'pointsAgainstStat';

                    statForm.appendChild(winsStatInput);
                    statForm.appendChild(lossesStatInput);
                    statForm.appendChild(pointsForStatInput);
                    statForm.appendChild(pointsAgainstStatInput);

                    var button = document.createElement('button');
                    button.type = 'submit';
                    button.innerHTML = 'Set Stats';
                    button.setAttribute('class', 'submit');

                    statForm.appendChild(button);

                    statForm.setAttribute('class', 'statsForm');
                    statForm.setAttribute('id', doc.data().name + '-stats');

                    statForm.addEventListener('submit', e => {
                        e.preventDefault();
                
                        var newStats = {};

                        if(statForm.winsStat.value !== ''){
                            newStats.wins = parseInt(statForm.winsStat.value);
                        }

                        if(statForm.lossesStat.value !== ''){
                            newStats.losses = parseInt(statForm.lossesStat.value);
                        }

                        if(statForm.pointsForStat.value !== ''){
                            newStats.pointsFor = parseInt(statForm.pointsForStat.value);
                        }
                        
                        if(statForm.pointsAgainstStat.value !== ''){
                            newStats.pointsAgainst = parseInt(statForm.pointsAgainstStat.value);
                        }

                        setStats(doc.data().name, newStats);

                        statForm.lossesStat.value = '';
                        statForm.winsStat.value = '';
                        statForm.pointsForStat.value = '';
                        statForm.pointsAgainstStat.value = '';
                    });

                    statForm.setAttribute('class', 'pt-3-half');

                    td.appendChild(statForm);
                }
            }
        }
        else if(change.doc.data().recentUpdate === 'points'){
            checkRanks(change.doc.data().name);
        }
    })
});