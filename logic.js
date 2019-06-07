/**
 * Publish the results on blockchain
 * @param {org.daiict.mynetwork.signature}signature
 * @transaction
 */
function sign(signature){
    var university=signature.merkleRoot.university;
    var signatories= signature.merkleRoot.signatories;
    var signed=signature.merkleRoot.signed;
    var professor=signature.professor.professorID;
    var professorUniversity=signature.professor.university;
    if(professorUniversity!=university){
        throw new Error('You are not affiliated with this university.');
    }
    var isSignatory=signatories.includes(signature.professor);
    if(!isSignatory){
        throw new Error('You are not required to sign this contract.');
    }
    var isSigned=signed.includes(signature.professor);
    if(isSigned){
        throw new Error('You have already signed the contract.');
    }
    signed.push(signature.professor);
    if(signed.length==signatories.length){
        signature.merkleRoot.status='verified';
    }
    return getAssetRegistry('org.daiict.mynetwork.MerkleRoot')
        .then(function (assetRegistry) {
            return assetRegistry.update(signature.merkleRoot);
        })
    
}

/**
 * Publish the results on blockchain
 * @param {org.daiict.mynetwork.verifyTranscript}verifyTranscript
 * @transaction
 */
 function verify(verifyTranscript){
     var transcriptHash=verifyTranscript.transcriptHash;
     var batchID=verifyTranscript.batchID;
     console.log(batchID);
     var merklePath=verifyTranscript.merklePath;
     var user=verifyTranscript.user;
     var result=verifyTranscript.result;
     var universityIDs=verifyTranscript.university.universityID;
     // Get the vehicle asset registry.
    return getAssetRegistry('org.daiict.mynetwork.MerkleRoot')
        .then(function (assetRegistry) {
        // Get the specific vehicle from the vehicle asset registry.
            return assetRegistry.get(batchID);
        })
        .then(function (merkleRoot){
        console.log(merkleRoot.merkleRootValue);
        console.log(merkleRoot.university);
        // Process the the vehicle object.
        var merkleRootValue=merkleRoot.merkleRootValue;
        var universityIDstored=merkleRoot.university;
        if(universityIDstored.universityID != universityIDs){
            // Get the vehicle asset registry.
            console.log('Its not a match');
            result='universityID not valid';
            // The existing vehicle that has come from elsewhere.
            // Get the vehicle asset registry.
            return getAssetRegistry('org.daiict.mynetwork.MerkleRoot')
            .then(function (merkleRootAssetRegistry) {
                // Update the vehicle in the vehicle asset registry.
                return merkleRootAssetRegistry.update(batchID);
            })
            .catch(function (error1) {
                // Add optional error handling here.
                throw new Error('Problem retreiving the universityID');
            });
        }
        else{
      		console.log(merkleRoot.mmerkleRootValue);
            console.log(transcriptHash);
            if(merkleRoot.merkleRootValue==transcriptHash){  
                console.log('Its a match');
                result='Verified';
                // The existing vehicle that has come from elsewhere.
                // Get the vehicle asset registry.
                return getAssetRegistry('org.daiict.mynetwork.MerkleRoot')
                .then(function (merkleRootAssetRegistry) {
                    // Update the vehicle in the vehicle asset registry.
                    return merkleRootAssetRegistry.update(batchID);
                })
                .catch(function (error2) {
                    // Add optional error handling here.
                    throw new Error('Unable to update positive result');
                });

            }
            else{
                result='Tampered Transcript';
                // The existing vehicle that has come from elsewhere.
                // Get the vehicle asset registry.
                return getAssetRegistry('org.daiict.mynetwork.MerkleRoot')
                .then(function (merkleRootAssetRegistry) {
                    // Update the vehicle in the vehicle asset registry.
                    return merkleRootAssetRegistry.update(batchID);
                })
                .catch(function (error3) {
                    // Add optional error handling here.
                    throw new Error('Unable to update negative result');
                });
            }
        }

        })
        .catch(function (error) {
        // Add optional error handling here.
        throw new Error('Object Not Found Sorry');
        });
}
 
