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
     //Get All the objects into local variable.
     var t_transcriptHash=verifyTranscript.transcriptHash;
     var t_batchID=verifyTranscript.batchID;
     var t_merklePath=verifyTranscript.merklePath;
     var t_user=verifyTranscript.user;
     var t_university=verifyTranscript.university;
     // Get the MerkleRoot Asset Registry
   console.log(t_batchID);
    return getAssetRegistry('org.daiict.mynetwork.MerkleRoot')
        .then(function (assetRegistry) {
        // Get the specific merkle Root from the Merkle Root asset registry.
            return assetRegistry.get(t_batchID);
        })
        .then(function (merkleRoot){
        var d_university=merkleRoot.university;
        var d_merkleRootValue=merkleRoot.merkleRootValue;
        var d_status=merkleRoot.status;
        console.log(d_university);
        console.log(d_merkleRootValue);
        console.log(t_university.universityID);
        //Compare UniversityID's
        if(t_university.universityID != d_university.universityID){
            var factory=getFactory();
            var random=Math.floor((Math.random() * 1000) + 1);
            var verificationID=t_user.userID + random;
            var new_verification=factory.newResource('org.daiict.mynetwork','verificationRequest',verificationID);
            new_verification.result='universityID not valid';
            new_verification.user=t_user;
            new_verification.transcriptHash=t_transcriptHash;
            // Get the verificationRequests Asset Registry.
            return getAssetRegistry('org.daiict.mynetwork.verificationRequest')
            .then(function (verificationAssetRegistry) {
                // Add the new verificationRequest to the AssetRegistry in the vehicle asset registry.
                return verificationAssetRegistry.add(new_verification);
            })
            .catch(function (error1) {
                // Add optional error handling here.
                throw new Error('Problem retreiving the universityID');
            });
        }
        else{
            console.log(d_merkleRootValue);
           console.log(t_transcriptHash);
            if(d_merkleRootValue==t_transcriptHash){  
                var factory=getFactory();
                var random=Math.floor((Math.random() * 1000) + 1);
                var verificationID=t_user.userID + random;
                var new_verification=factory.newResource('org.daiict.mynetwork','verificationRequest',verificationID);
                new_verification.result='Valid Transcript';
                new_verification.user=t_user;
                new_verification.transcriptHash=t_transcriptHash;
                // Get the verificationRequests Asset Registry.
                return getAssetRegistry('org.daiict.mynetwork.verificationRequest')
                .then(function (verificationAssetRegistry) {
                    // Add the new verificationRequest to the AssetRegistry in the vehicle asset registry.
                    return verificationAssetRegistry.add(new_verification);
                })
                .catch(function (error1) {
                    // Add optional error handling here.
                    throw new Error('Problem retreiving the universityID');
                });
            }
            else{
                var factory=getFactory();
                var random=Math.floor((Math.random() * 1000) + 1);
                var verificationID=t_user.userID + random;
                var new_verification=factory.newResource('org.daiict.mynetwork','verificationRequest',verificationID);
                new_verification.result='Tampered Transcript';
                new_verification.user=t_user;
                new_verification.transcriptHash=t_transcriptHash;
                // Get the verificationRequests Asset Registry.
                return getAssetRegistry('org.daiict.mynetwork.verificationRequest')
                .then(function (verificationAssetRegistry) {
                    // Add the new verificationRequest to the AssetRegistry in the vehicle asset registry.
                    return verificationAssetRegistry.add(new_verification);
                })
                .catch(function (error1) {
                    // Add optional error handling here.
                    throw new Error('Problem retreiving the universityID');
                });
            }
        }

        })
        .catch(function (error) {
        // Add optional error handling here.
        throw new Error('Object Not Found Sorry');
        });
}
 
