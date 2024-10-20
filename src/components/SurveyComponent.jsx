import React, { useState, useEffect, useCallback } from "react";
import { usePrivy } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import { supabase } from '../supabaseClient';
import { getName, verifyNameOwnership, registerRNS } from '../ensService';
import DataTokenABI from '../abis/DataTokenABI.json';
import LoginScreen from './LoginScreen';
import Navbar from './Navbar';
import ProfilePage from './ProfilePage';
import SurveyList from './SurveyList';
import SurveyCreator from './SurveyCreator';
import SurveyResults from './SurveyResults';
import TokenMarketplace from './TokenMarketplace';
import "../styles/SurveyComponent.css";

function SurveyComponent() {
    const { authenticated, user, logout } = usePrivy();
    const [currentView, setCurrentView] = useState('home');
    const [previousView, setPreviousView] = useState('home');
    const [surveys, setSurveys] = useState([]);
    const [answeredSurveys, setAnsweredSurveys] = useState([]);
    const [isEnterprise, setIsEnterprise] = useState(false);
    const [userName, setUserName] = useState(null);
    const [currentSurvey, setCurrentSurvey] = useState(null);
    const [showNamePrompt, setShowNamePrompt] = useState(false);
    const [credibilityScore, setCredibilityScore] = useState(0);
    const [nameType, setNameType] = useState(null);
    const [initialSurveyCompleted, setInitialSurveyCompleted] = useState(false);
    const [availableSurveys, setAvailableSurveys] = useState([]);
    const [showAllSurveys, setShowAllSurveys] = useState(false);
    const [canAnswerSurveys, setCanAnswerSurveys] = useState(false);
    const [showCredibilityPrompt, setShowCredibilityPrompt] = useState(false);
    const [dataTokenContract, setDataTokenContract] = useState(null);
    const [contractError, setContractError] = useState(null);

    const setupDataTokenContract = useCallback(async () => {
        try {
            console.log("Setting up DataToken contract...");
            const provider = new ethers.BrowserProvider(window.ethereum);
            console.log("Provider created:", provider);
            const signer = await provider.getSigner();
            console.log("Signer obtained:", signer);
            const contractAddress = process.env.REACT_APP_DATA_TOKEN_ADDRESS;
            
            console.log("Contract address:", contractAddress);
            console.log("Signer address:", await signer.getAddress());

            if (!contractAddress) {
                throw new Error("Contract address is not set in environment variables");
            }

            const contract = new ethers.Contract(contractAddress, DataTokenABI, signer);
            console.log("Contract instance created:", contract);

            // Test contract connection
            try {
                const name = await contract.name();
                console.log("Contract name:", name);
            } catch (error) {
                console.error("Error calling contract method:", error);
            }

            setDataTokenContract(contract);
            setContractError(null);
            console.log("DataToken contract set up successfully");
        } catch (error) {
            console.error("Error setting up DataToken contract:", error);
            setContractError(error.message);
        }
    }, []);

    useEffect(() => {
        console.log("Authentication status:", authenticated);
        console.log("User object:", user);
        if (authenticated && user) {
            handleUserAuthentication();
            setupDataTokenContract();
        }
    }, [authenticated, user, setupDataTokenContract]);

    useEffect(() => {
        console.log("showCredibilityPrompt:", showCredibilityPrompt);
    }, [showCredibilityPrompt]);

    const handleUserAuthentication = async () => {
        if (user && user.wallet?.address) {
            try {
                console.log("Authenticating user:", user.wallet.address);
                let userDetails = await fetchUser(user.wallet.address);
                console.log("Fetched user details:", userDetails);

                if (!userDetails) {
                    console.log("User not found, creating new user");
                    userDetails = await createUser(user.wallet.address);
                    console.log("Created user details:", userDetails);
                }

                if (userDetails) {
                    console.log("Processing user details:", userDetails);
                    setUserName(userDetails.ens_name);
                    setIsEnterprise(userDetails.user_type === 'enterprise');
                    setCredibilityScore(userDetails.credibility_score || 0);
                    setInitialSurveyCompleted(userDetails.initial_survey_completed || false);

                    // Set showCredibilityPrompt based on the credibility score
                    setShowCredibilityPrompt(userDetails.credibility_score < 15);

                    await fetchSurveys();
                } else {
                    console.error('Failed to fetch or create user');
                }
            } catch (error) {
                console.error('Error in handleUserAuthentication:', error);
                console.error('Error stack:', error.stack);
            }
        } else {
            console.error('User or user wallet address is undefined');
        }
    };

    const fetchUser = async (walletAddress) => {
        console.log("Fetching user:", walletAddress);
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('wallet_address', walletAddress)
                .single();

            if (error) {
                console.error('Error fetching user:', error);
                return null;
            }

            console.log("Fetched user data:", data);
            return data;
        } catch (error) {
            console.error('Exception in fetchUser:', error);
            return null;
        }
    };

    const createUser = async (walletAddress) => {
        console.log("Creating new user:", walletAddress);
        try {
            console.log("Calling getName function");
            const nameResult = await getName(walletAddress);
            console.log("getName result:", nameResult);

            const name = nameResult ? nameResult.name : walletAddress.slice(0, 8); // Use first 8 characters of wallet address if no name

            const isEnterprise = localStorage.getItem('isEnterprise') === 'true';

            const newUser = {
                wallet_address: walletAddress,
                ens_name: name, // This will never be null now
                user_type: isEnterprise ? 'enterprise' : 'regular',
                credibility_score: 0,
                initial_survey_completed: false
            };

            console.log("Attempting to insert new user:", newUser);
            const { data, error } = await supabase
                .from('users')
                .insert([newUser])
                .select();

            if (error) {
                console.error('Error creating user:', error);
                return null;
            }

            console.log("Created new user:", data[0]);
            return data[0];
        } catch (error) {
            console.error('Exception in createUser:', error);
            console.error('Error stack:', error.stack);
            return null;
        }
    };

    const fetchInitialSurvey = async () => {
        console.log("Fetching initial survey");
        const { data, error } = await supabase
            .from('surveys')
            .select('*')
            .limit(1);

        if (error) {
            console.error('Error fetching initial survey:', error);
        } else {
            console.log("Initial survey fetched:", data);
            setSurveys(data);
        }
    };

    const fetchAllSurveys = async () => {
        console.log("Fetching all surveys");
        const { data, error } = await supabase
            .from('surveys')
            .select('*');

        if (error) {
            console.error('Error fetching all surveys:', error);
        } else {
            console.log("All surveys fetched:", data);
            setSurveys(data);
            updateAvailableSurveys(data);
        }
    };

    const fetchAnsweredSurveys = async (allSurveys) => {
        if (!user || !user.wallet?.address) {
            console.error('No user wallet address available');
            return;
        }

        console.log("Fetching answered surveys for wallet:", user.wallet.address);
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('wallet_address', user.wallet.address)
            .single();

        if (userError) {
            console.error('Error fetching user data:', userError);
            return;
        }

        const { data, error } = await supabase
            .from('user_survey_responses')
            .select('survey_id')
            .eq('user_wallet_address', user.wallet.address);
        
        if (error) {
            console.error('Error fetching answered surveys:', error);
        } else {
            console.log("Answered surveys fetched:", data);
            const answeredIds = data.map(item => item.survey_id);
            setAnsweredSurveys(allSurveys.filter(survey => answeredIds.includes(survey.id)));
            
            setInitialSurveyCompleted(userData.initial_survey_completed);
            setCanAnswerSurveys(canUserAnswerSurveys(userData));
            
            // Always set all unanswered surveys
            const unansweredSurveys = allSurveys.filter(survey => !answeredIds.includes(survey.id));
            
            console.log("Initial survey completed:", userData.initial_survey_completed);
            console.log("Unanswered surveys:", unansweredSurveys);

            if (!userData.initial_survey_completed && unansweredSurveys.length > 0) {
                // If initial survey is not completed, show only one survey
                setAvailableSurveys([unansweredSurveys[0]]);
                console.log("Setting one survey:", [unansweredSurveys[0]]);
            } else {
                // If initial survey is completed, show all unanswered surveys
                setAvailableSurveys(unansweredSurveys);
                console.log("Setting all unanswered surveys:", unansweredSurveys);
            }
        }
    };

    const updateAvailableSurveys = (allSurveys, answeredIds) => {
        const available = allSurveys.filter(survey => !answeredIds.includes(survey.id));
        setAvailableSurveys(available);
    };

    const handleNameVerification = async (createName) => {
        if (createName) {
            const newRNSName = await registerRNS(user.wallet.address);
            if (newRNSName) {
                await updateUserName(user.wallet.address, newRNSName, 'RNS');
                setUserName(newRNSName);
                await updateUserCredibility(user.wallet.address, 20);
            }
        } else {
            // Implement staking logic here
            console.log("User needs to stake 0.005 tRBTC");
            await updateUserCredibility(user.wallet.address, 15);
        }
        // Check if credibility is now 15 or more
        const updatedUserDetails = await fetchUser(user.wallet.address);
        setShowCredibilityPrompt(updatedUserDetails.credibility_score < 15);
    };

    const updateUserName = async (walletAddress, name, type) => {
        const { data, error } = await supabase
            .from('users')
            .update({ 
                ens_name: name,
                name_type: type
            })
            .eq('wallet_address', walletAddress);

        if (error) {
            console.error('Error updating user name:', error);
        } else {
            console.log(`Updated user name to ${name} (${type}) for address ${walletAddress}`);
        }
    };

    const updateUserCredibility = async (walletAddress, points) => {
        const { data: userData, error: fetchError } = await supabase
            .from('users')
            .select('credibility_score')
            .eq('wallet_address', walletAddress)
            .single();

        if (fetchError) {
            console.error('Error fetching user credibility:', fetchError);
            return;
        }

        const newScore = (userData.credibility_score || 0) + points;

        const { data, error } = await supabase
            .from('users')
            .update({ credibility_score: newScore })
            .eq('wallet_address', walletAddress);

        if (error) {
            console.error('Error updating user credibility:', error);
        } else {
            setCredibilityScore(newScore);
            setShowCredibilityPrompt(newScore < 15);
        }
    };

    const createMockENSName = async (address) => {
        const baseEnsName = address.slice(2, 8);
        let ensName = baseEnsName;
        let counter = 1;
        while (!(await isENSNameAvailable(ensName))) {
            ensName = `${baseEnsName}${counter}`;
            counter++;
        }
        await registerENS(address, ensName);
        return `${ensName}.eth`;
    };

    const fetchSurveys = async () => {
        let query;
        if (isEnterprise && user && user.wallet?.address) {
            query = supabase
                .from('surveys')
                .select('*')
                .eq('creator_wallet_address', user.wallet.address);
        } else {
            query = supabase
                .from('surveys')
                .select('*');
        }

        const { data, error } = await query;
        if (error) {
            console.error('Error fetching surveys:', error);
        } else {
            console.log("Surveys fetched:", data);
            setSurveys(data);
            if (!isEnterprise) {
                await fetchAnsweredSurveys(data);
            } else {
                setAvailableSurveys(data);
            }
        }
    };

    const answerSurvey = (survey) => {
        setCurrentSurvey(survey);
        setCurrentView('answer');
    };

    const handleCreateSurvey = async (surveyData) => {
        if (!user || !user.wallet?.address) {
            console.error('No user wallet address available');
            return;
        }

        try {
            const { data, error } = await supabase
                .from('surveys')
                .insert([
                    {
                        ...surveyData,
                        creator_wallet_address: user.wallet.address
                    }
                ])
                .select();

            if (error) {
                console.error('Error creating survey:', error);
            } else {
                console.log('Survey created successfully:', data);
                await mintDataToken(data[0]); // Mint a DataToken for the new survey
                await fetchSurveys();
                setCurrentView('home');
            }
        } catch (error) {
            console.error('Error in survey creation process:', error);
        }
    };

    const handleAnswerSurvey = async (surveyId, answers) => {
        if (!user || !user.wallet?.address) {
            console.error('No user wallet address available');
            return;
        }

        try {
            const { data, error } = await supabase
                .from('survey_results')
                .insert([
                    { 
                        survey_id: surveyId, 
                        user_wallet_address: user.wallet.address, 
                        answers: answers 
                    }
                ]);

            if (error) {
                console.error('Error submitting survey answers:', error);
            } else {
                console.log('Survey answers submitted successfully:', data);
                
                // Also update the user_survey_responses table
                const { error: responseError } = await supabase
                    .from('user_survey_responses')
                    .insert([
                        { 
                            user_wallet_address: user.wallet.address, 
                            survey_id: surveyId 
                        }
                    ]);

                if (responseError) {
                    console.error('Error updating user_survey_responses:', responseError);
                }

                // Increase credibility score and mark initial survey as completed
                const newScore = credibilityScore + 5;
                const { error: updateError } = await supabase
                    .from('users')
                    .update({ 
                        credibility_score: newScore,
                        initial_survey_completed: true 
                    })
                    .eq('wallet_address', user.wallet.address);

                if (updateError) {
                    console.error('Error updating user credibility score:', updateError);
                } else {
                    setCredibilityScore(newScore);
                    setInitialSurveyCompleted(true);
                }

                await fetchSurveys();
                setCurrentView('home');
            }
        } catch (error) {
            console.error('Error answering survey:', error);
        }
    };

    const changeView = (newView) => {
        setPreviousView(currentView);
        setCurrentView(newView);
    };

    const shouldShowAllSurveys = (userDetails) => {
        return userDetails.credibility_score >= 15 || !userDetails.initial_survey_completed;
    };

    const canUserAnswerSurveys = (userDetails) => {
        return userDetails.credibility_score >= 15 || !userDetails.initial_survey_completed;
    };

    const mintDataToken = async (surveyData) => {
        if (!dataTokenContract) {
            console.error("DataToken contract not initialized");
            return;
        }
        try {
            const tx = await dataTokenContract.mint(
                user.wallet.address,
                Date.now(), // Using timestamp as tokenId for simplicity
                surveyData.title,
                surveyData.description,
                surveyData.category,
                surveyData.dataSize,
                surveyData.datasetHashOrURL
            );
            await tx.wait();
            console.log("DataToken minted successfully");
        } catch (error) {
            console.error("Error minting DataToken:", error);
        }
    };

    const updateSurveyMetadata = async (tokenId, surveyData) => {
        if (!dataTokenContract) {
            console.error("DataToken contract not initialized");
            return;
        }
        try {
            const tx = await dataTokenContract.updateMetadata(
                tokenId,
                surveyData.title,
                surveyData.description,
                surveyData.category,
                surveyData.dataSize,
                surveyData.datasetHashOrURL
            );
            await tx.wait();
            console.log("Survey metadata updated successfully");
        } catch (error) {
            console.error("Error updating survey metadata:", error);
        }
    };

    const getSurveyData = async (tokenId) => {
        if (!dataTokenContract) {
            console.error("DataToken contract not initialized");
            return null;
        }
        try {
            const data = await dataTokenContract.getSurveyData(tokenId);
            return data;
        } catch (error) {
            console.error("Error getting survey data:", error);
            return null;
        }
    };

    const handleMintResult = async (result) => {
        if (!dataTokenContract) {
            console.error("DataToken contract not initialized");
            setContractError("DataToken contract not initialized");
            return;
        }
        try {
            const tokenId = Date.now(); // Using timestamp as tokenId for simplicity
            console.log("Minting token with ID:", tokenId);
            console.log("Result data:", result);

            const signer = await dataTokenContract.signer.getAddress();
            console.log("Signer address:", signer);

            const gasEstimate = await dataTokenContract.mint.estimateGas(
                signer,
                tokenId,
                `Survey Result for Survey ${result.survey_id}`,
                `Result from ${result.user_wallet_address}`,
                "Survey Result",
                JSON.stringify(result.answers).length,
                JSON.stringify(result)
            );
            console.log("Estimated gas:", gasEstimate.toString());

            const tx = await dataTokenContract.mint(
                signer,
                tokenId,
                `Survey Result for Survey ${result.survey_id}`,
                `Result from ${result.user_wallet_address}`,
                "Survey Result",
                JSON.stringify(result.answers).length,
                JSON.stringify(result)
            );
            console.log("Transaction sent:", tx);

            const receipt = await tx.wait();
            console.log("Transaction confirmed:", receipt);

            console.log("Survey result minted as DataToken successfully");
        } catch (error) {
            console.error("Error minting DataToken for survey result:", error);
            setContractError(error.message);
        }
    };

    const grantDataProviderRole = async () => {
        if (!dataTokenContract) {
            console.error("DataToken contract not initialized");
            return;
        }
        try {
            const tx = await dataTokenContract.grantDataProviderRole(user.wallet.address);
            await tx.wait();
            console.log("DATA_PROVIDER_ROLE granted successfully");
        } catch (error) {
            console.error("Error granting DATA_PROVIDER_ROLE:", error);
        }
    };

    const checkAndGrantRole = async () => {
        if (!dataTokenContract) {
            console.error("DataToken contract not initialized");
            return;
        }
        try {
            const signer = await dataTokenContract.signer.getAddress();
            const hasRole = await dataTokenContract.hasRole(await dataTokenContract.DATA_PROVIDER_ROLE(), signer);
            if (!hasRole) {
                console.log("Account doesn't have DATA_PROVIDER_ROLE, attempting to grant...");
                const tx = await dataTokenContract.grantDataProviderRole(signer);
                await tx.wait();
                console.log("DATA_PROVIDER_ROLE granted successfully");
            } else {
                console.log("Account already has DATA_PROVIDER_ROLE");
            }
        } catch (error) {
            console.error("Error checking or granting role:", error);
        }
    };

    // Call this function after setting up the contract
    useEffect(() => {
        if (dataTokenContract) {
            checkAndGrantRole();
        }
    }, [dataTokenContract]);

    if (!authenticated) {
        return <LoginScreen />;
    }

    return (
        <div className="app-container">
            <Navbar 
                isEnterprise={isEnterprise} 
                userName={userName}
                logout={logout}
                setCurrentView={changeView}
                credibilityScore={credibilityScore}
            />
            <div className="main-content">
                {contractError && (
                    <div className="error-message">
                        Contract Error: {contractError}
                    </div>
                )}
                {showCredibilityPrompt && (
                    <div className="credibility-prompt">
                        <h2>Increase Your Credibility</h2>
                        <p>Would you like to create an RNS name (20 points) or stake 0.005 tRBTC (15 points)?</p>
                        <div className="credibility-prompt-buttons">
                            <button className="nav-button" onClick={() => handleNameVerification(true)}>Create RNS name</button>
                            <button className="nav-button" onClick={() => handleNameVerification(false)}>Stake 0.005 tRBTC</button>
                        </div>
                    </div>
                )}
                {currentView === 'profile' && (
                    <ProfilePage 
                        user={user} 
                        userName={userName} 
                        isEnterprise={isEnterprise} 
                        onClose={() => setCurrentView(previousView)}
                    />
                )}
                {currentView === 'home' && (
                    <SurveyList 
                        surveys={availableSurveys}
                        answeredSurveys={answeredSurveys}  // Pass answeredSurveys here
                        isEnterprise={isEnterprise}
                        onEditSurvey={(survey) => {
                            setCurrentSurvey(survey);
                            changeView('creator');
                        }}
                        onViewResults={(surveyId) => {
                            setCurrentSurvey(surveys.find(s => s.id === surveyId));
                            changeView('results');
                        }}
                        onAnswerSurvey={(survey) => {
                            setCurrentSurvey(survey);
                            changeView('answer');
                        }}
                        currentView={currentView}
                        canAnswerSurveys={canAnswerSurveys}
                        credibilityScore={credibilityScore}
                        initialSurveyCompleted={initialSurveyCompleted}
                    />
                )}
                {currentView === 'answered' && (
                    <SurveyList 
                        surveys={answeredSurveys}
                        isEnterprise={isEnterprise}
                        onViewResults={(surveyId) => {
                            setCurrentSurvey(surveys.find(s => s.id === surveyId));
                            changeView('results');
                        }}
                        currentView={currentView}
                    />
                )}
                {currentView === 'creator' && (
                    <SurveyCreator 
                        onSave={handleCreateSurvey}
                    />
                )}
                {currentView === 'answer' && currentSurvey && (
                    <SurveyCreator 
                        survey={currentSurvey}
                        isAnswering={true}
                        onSubmit={(answers) => handleAnswerSurvey(currentSurvey.id, answers)}
                    />
                )}
                {currentView === 'results' && (
                    <SurveyResults 
                        surveyId={currentSurvey?.id}
                        onBack={() => changeView('home')}
                        isEnterprise={isEnterprise}
                        onMintResult={handleMintResult}
                        dataTokenContract={dataTokenContract}
                    />
                )}
                {currentView === 'marketplace' && (
                    <TokenMarketplace 
                        dataTokenContract={dataTokenContract}
                        userAddress={user.wallet.address}
                    />
                )}
                {isEnterprise && (
                    <button onClick={grantDataProviderRole}>Grant Data Provider Role</button>
                )}
            </div>
        </div>
    );
}

export default SurveyComponent;
