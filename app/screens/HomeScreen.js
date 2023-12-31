import { FlatList, StyleSheet } from 'react-native'
import { Text } from 'react-native';
import React, { useEffect, useState } from 'react'
import dummyData from '../constants/dummyData';
import { useTheme } from '../constants/theme';
import { DoctorsNearYou, Post } from '../components';
// import CompleteModal from '../components/Modal/Modal';
import { useDispatch, useSelector } from 'react-redux';
import { Modal, Portal } from 'react-native-paper';
import { Provider as PaperProvider } from 'react-native-paper'
import InputLogin from '../components/InputLogin';
import Button from '../components/Button';
import { addUser, auth, db } from '../config/firebaseConfig';
import { updateProfile } from 'firebase/auth';
import { extractLastName, generateRandomGravatarUrl, generateRandomString } from '../constants/helpers';
import Toast from 'react-native-toast-message'
import { addDoc, collection, getFirestore, getDoc, where, query, getDocs } from "firebase/firestore";
import { getUserInfo } from '../store/actions';
import { StatusBar } from 'expo-status-bar';

const HomeScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const user = useSelector((state) => state.auth.user);
  const [userInfo, setUserInfo] = useState({});
  const [visible, setVisible] = React.useState(typeof auth.currentUser.displayName != 'string' ? true : false);
  const [v1, setV1] = React.useState(userInfo && userInfo.type != extractLastName(user && user.user.displayName) ? false : false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const showModal = () => setVisible(false);
  const hideModal = () => setVisible(false);
  const dispatch = useDispatch()

  const getUser = async () => {
    const user = auth.currentUser;
    const uid = user.uid;

    const docRef = collection(db, "users");
    const q = query(docRef, where("id", "==", uid));

    try {
      const querySnapshot = await getDocs(q);
      if (querySnapshot) {
        const firstDoc = querySnapshot.docs[0];
        const firstDocData = firstDoc ? firstDoc.data() : null;
        setUserInfo(firstDocData)
        console.log(firstDocData)

        return firstDocData
      } else {
        console.log("Document does not exist")
        return null
      }
    } catch (error) {
      console.error(error)
      return null
    }
  }

  useEffect(() => {
    const u = getUser();
    dispatch(getUserInfo(u));
    setUserInfo(u)
    console.log("user info: ", userInfo)
  }, [visible])

  // Extracting all posts into a single array
  const allPosts = dummyData.Doctors
    .filter((doctor) => doctor.posts)
    .flatMap((doctor) => doctor.posts || []);

  // Sorting the posts by publishDate
  const sortedPosts = allPosts.sort((postA, postB) => {
    const dateA = new Date(postA.publishDate);
    const dateB = new Date(postB.publishDate);
    return dateB - dateA; // Sort by descending order (most recent first)
  });
  // const containerStyle = {backgroundColor: 'white', padding: 20};

  const handlePress = async () => {
    const u = await getUser()
    console.log("user: ", u)
    const additionalInfo = {
      type: u ? u.type : "patient",
    };

    updateProfile(auth.currentUser, {
      displayName: name + " " + additionalInfo.type, photoURL: generateRandomGravatarUrl(), email: email, additionalInfo: additionalInfo
    }).then(() => {
      const creds = { id: user && user.user.uid, name: name, email: email, phoneNumber: user && user.user.phoneNumber, type: "patient" }
      // console.log(user.user.uid)
      if (auth.currentUser && !u) {
        addUser(creds);
      } else {
        // setV1(false)
        Toast.show({
          text1: 'Profile already up to date',
          type: 'success', // Can be 'success', 'info', 'warning', or 'error'
          position: 'top', // Can be 'top', 'center', or 'bottom'
          duration: 3000, // Duration in milliseconds
        });
        console.log("No current user")
      }
    }).then(() => {
      Toast.show({
        text1: 'Profile updated successfully',
        // text2: 'Additional text can go here',
        type: 'success', // Can be 'success', 'info', 'warning', or 'error'
        position: 'top', // Can be 'top', 'center', or 'bottom'
        duration: 3000, // Duration in milliseconds
      });
      setVisible(false)
    }).catch((error) => {
      Toast.show({
        text1: 'An error occured while updating',
        // text2: 'Additional text can go here',
        type: 'error', // Can be 'success', 'info', 'warning', or 'error'
        position: 'top', // Can be 'top', 'center', or 'bottom'
        duration: 3000, // Duration in milliseconds
      });
    });
  }

  return (
    <PaperProvider>
      <Portal>
        <FlatList
          ListHeaderComponent={<DoctorsNearYou
            onPress={(doctorInfo) => {
              navigation.navigate('doctor', { doctorInfo });
            }}
          />}
          data={sortedPosts}
          keyExtractor={(item) => item.postId.toString()}
          renderItem={({ item }) => (
            <Post
              DoctorName={item?.DoctorName || "No Name"} // Update DoctorName based on available data
              PostPublishDate={item.publishDate}
              DoctorPhoto={item.DoctorPhoto || require('../../assets/SmileDom_1.png')} // Use default photo if not available
              postImage={item.postImage}
              likes={item.likes.toString()}
              comments={item.comments.toString()}
              onPress={() => navigation.navigate('doctor', { doctorInfo: item })}
            />
          )}
          style={{
            flex: 1,
            backgroundColor: theme.colors.Background,
            paddingBottom: 500,
          }}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
        <Modal
          visible={visible}
          onDismiss={hideModal}
          contentContainerStyle={styles.modal}
        >
          <Text>Almost done! Please for the info below</Text>
          <InputLogin ititle="Name" handleInput={setName} />
          <InputLogin ititle="Email" handleInput={setEmail} />
          <Button
            title={"Submit"}
            onPress={handlePress}
            textColor={theme.colors.White}
            buttonColor={theme.colors.Primary}
          />
        </Modal>
      </Portal>
      <StatusBar backgroundColor={'#BFD101'}/>
    </PaperProvider>
  )
}

export default HomeScreen

const styles = StyleSheet.create({
  modal: {
    backgroundColor: "white",
    padding: 20,
  }
})
